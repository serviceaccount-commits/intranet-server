import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IClientService } from '../interfaces/clients/client.service.interface';
import { IClientRepository } from '../interfaces/clients/client.repository.interface';
import { ITopicRepository } from '../interfaces/topics/topic.repository.interface';
import { KbClient, PaginatedKbClientResult } from '../database/kb-domain.types';
import { ConflictError } from '../../../../shared/errors/ConflictError';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import { CreateClientInput, CreateClientSchema } from '../schema/clients/CreateClientSchema';
import { UpdateClientInput, UpdateClientSchema } from '../schema/clients/UpdateClientSchema';
import { FilterClientInput } from '../schema/clients/FilterClientSchema';
import ES from '../../../../shared/types/enum/ES';
import CURRENCY from '../../../../shared/types/enum/CURRENCY';
import REGION from '../../../../shared/types/enum/REGION';

@injectable()
export class ClientService implements IClientService {
  constructor(
    @inject(TYPES.IClientRepository)
    private clientRepository: IClientRepository,
    @inject(TYPES.ITopicRepository)
    private topicRepository: ITopicRepository,
  ) {}

  async createClient(input: CreateClientInput, userId: string): Promise<KbClient> {
    const data = CreateClientSchema.parse(input);

    const existing = await this.clientRepository.findByName(data.clientName);
    if (existing) {
      throw new ConflictError(`Client "${data.clientName}" already exists.`);
    }

    if (data.isFLX && data.isIM) {
      throw new BusinessLogicError('Client cannot be both Flex and IM.');
    }

    if (data.isFLX) {
      const existingFlx = await this.clientRepository.findFLXClient();
      if (existingFlx) throw new BusinessLogicError('A Flex client already exists.');
    }

    if (data.isIM) {
      const existingIm = await this.clientRepository.findIMClient();
      if (existingIm) throw new BusinessLogicError('An IM client already exists.');
    }

    const region: string = data.entity === ES.PARICUS_LLC ? REGION.US : REGION.CO;

    const clientsInRegion = await this.clientRepository.findAllByRegionOrdered(region);
    let sharedIdSuffix = 1;
    if (clientsInRegion.length > 0) {
      const lastClient = clientsInRegion[0];
      if (lastClient) {
        const lastNum = parseInt(lastClient.client_shared_id?.split('_').pop() ?? '0', 10);
        sharedIdSuffix = isNaN(lastNum) ? 1 : lastNum + 1;
      }
    }
    const clientSharedId = `PA_${region.toUpperCase()}_${sharedIdSuffix}`;

    const client = await this.clientRepository.create({
      client_name: data.clientName,
      client_shared_id: clientSharedId,
      region,
      entity: data.entity,
      // Not sent by every caller: default to what the entity usually bills in,
      // which reproduces the behaviour that used to be inferred from the country.
      currency:
        data.currency ??
        (data.entity === ES.PARICUS_COLOMBIA ? CURRENCY.COP : CURRENCY.USD),
      is_im: data.isIM ?? false,
      is_flx: data.isFLX ?? false,
      client_edit_available: true,
      address: data.address ?? null,
      primary_contact_name: data.primaryContactName ?? null,
      primary_contact_email: data.primaryContactEmail ?? null,
      primary_contact_phone: data.primaryContactPhone ?? null,
      user_id: userId,
    });

    // The KB tree only lists clients present in the user_clients access
    // table — grant the creator access so the new client is visible to them.
    await this.clientRepository.addUserAccess(client.client_id, userId);

    return client;
  }

  async updateClient(input: UpdateClientInput): Promise<KbClient> {
    const data = UpdateClientSchema.parse(input);

    const client = await this.clientRepository.findById(data.clientId);
    if (!client) throw new NotFoundError('Client', data.clientId);

    if (data.clientName !== undefined && data.clientName !== client.client_name) {
      const existing = await this.clientRepository.findByName(data.clientName);
      if (existing && existing.client_id !== client.client_id) {
        throw new ConflictError(`Client "${data.clientName}" already exists.`);
      }
      client.client_name = data.clientName;
    }

    if (data.entity !== undefined) {
      client.entity = data.entity;
      // Region follows the entity for display/grouping; client_shared_id is
      // intentionally left untouched (see UpdateClientSchema).
      client.region = data.entity === ES.PARICUS_LLC ? REGION.US : REGION.CO;
    }

    if (data.currency !== undefined) client.currency = data.currency;
    if (data.address !== undefined) client.address = data.address;
    if (data.primaryContactName !== undefined) {
      client.primary_contact_name = data.primaryContactName;
    }
    if (data.primaryContactEmail !== undefined) {
      client.primary_contact_email = data.primaryContactEmail;
    }
    if (data.primaryContactPhone !== undefined) {
      client.primary_contact_phone = data.primaryContactPhone;
    }

    return this.clientRepository.save(client);
  }

  async getClientsByAccess(userId: string): Promise<KbClient[]> {
    return this.clientRepository.findAllWithUserId(userId);
  }

  async getClients(): Promise<KbClient[]> {
    return this.clientRepository.findAll();
  }

  async getFilteredClients(input: FilterClientInput): Promise<PaginatedKbClientResult> {
    return this.clientRepository.findAndCountAllFiltered(input);
  }

  async getClientById(clientId: string): Promise<KbClient> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new NotFoundError('Client', clientId);
    return client;
  }

  /**
   * Removes a client that holds nothing: no folders at all, deleted ones
   * included (they keep archived articles reachable). Folders go first, from
   * the KB tree; then the client and its staff access rows are dropped. The
   * portal keeps its own client record and has to be cleaned there.
   */
  async deleteClient(clientId: string): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new NotFoundError('Client', clientId);

    const topics = await this.topicRepository.findAllByClientIdsWithDeleted([clientId]);
    if (topics.length > 0) {
      const live = topics.filter((t) => !t.deleted_at).length;
      throw new BusinessLogicError(
        live > 0
          ? `"${client.client_name}" still has ${live} folder(s). Delete them from the Knowledge Base first.`
          : `"${client.client_name}" still has deleted folders with archived articles. Restore and delete them first.`,
      );
    }

    await this.clientRepository.deleteById(clientId);
  }
}
