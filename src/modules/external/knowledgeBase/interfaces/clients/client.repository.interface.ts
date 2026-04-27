import { KbClient, PaginatedKbClientResult } from '../../database/kb-domain.types';
import { FilterClientInput } from '../../schema/clients/FilterClientSchema';

export interface IClientRepository {
  create(data: Partial<KbClient>): Promise<KbClient>;
  findAll(): Promise<KbClient[]>;
  findAllWithUserId(userId: string): Promise<KbClient[]>;
  findAllByRegionOrdered(region: string): Promise<KbClient[]>;
  findById(id: string): Promise<KbClient | null>;
  findByIds(ids: string[]): Promise<KbClient[]>;
  findBySharedId(sharedId: string): Promise<KbClient | null>;
  findIMClient(): Promise<KbClient | null>;
  findFLXClient(): Promise<KbClient | null>;
  findByName(name: string): Promise<KbClient | null>;
  save(client: KbClient): Promise<KbClient>;
  findAndCountAllFiltered(input: FilterClientInput): Promise<PaginatedKbClientResult>;
}
