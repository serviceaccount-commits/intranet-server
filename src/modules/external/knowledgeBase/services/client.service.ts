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
import { UpdateClientInput } from '../schema/clients/UpdateClientSchema';
import { FilterClientInput } from '../schema/clients/FilterClientSchema';
import ES from '../../../../shared/types/enum/ES';
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
      is_im: data.isIM ?? false,
      is_flx: data.isFLX ?? false,
      client_edit_available: true,
      address: data.address ?? null,
      primary_contact_name: data.primaryContactName ?? null,
      primary_contact_email: data.primaryContactEmail ?? null,
      primary_contact_phone: data.primaryContactPhone ?? null,
      user_id: userId,
    });

    // Every new client gets a root folder so articles can be filed
    // immediately without a separate "create folder" step.
    await this.topicRepository.create({
      topic_name: 'Articles',
      topic_edit_available: true,
      client_id: client.client_id,
      parent_topic_id: null,
      user_id: userId,
    });

    return client;
  }

  async updateClient(input: UpdateClientInput): Promise<KbClient> {
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) throw new NotFoundError('Client', input.clientId);

    client.client_name = input.clientName;
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
}
