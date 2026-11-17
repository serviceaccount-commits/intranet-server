import { KbClient, PaginatedKbClientResult } from '../../database/kb-domain.types';
import { CreateClientInput } from '../../schema/clients/CreateClientSchema';
import { FilterClientInput } from '../../schema/clients/FilterClientSchema';
import { UpdateClientInput } from '../../schema/clients/UpdateClientSchema';

export interface IClientService {
  createClient(input: CreateClientInput, userId: string): Promise<KbClient>;
  updateClient(input: UpdateClientInput): Promise<KbClient>;
  getClientsByAccess(userId: string): Promise<KbClient[]>;
  getClients(): Promise<KbClient[]>;
  getFilteredClients(input: FilterClientInput): Promise<PaginatedKbClientResult>;
  getClientById(clientId: string): Promise<KbClient>;
  /** Only a client without folders (deleted ones included) can be removed. */
  deleteClient(clientId: string): Promise<void>;
}
