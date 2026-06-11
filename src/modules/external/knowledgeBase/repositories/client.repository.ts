import { injectable } from 'inversify';
import { ILike } from 'typeorm';

import { AppDataSource } from '../../../../shared/database/data-source';
import { Client } from '../entities/Client.entity';
import { IClientRepository } from '../interfaces/clients/client.repository.interface';
import { KbClient, PaginatedKbClientResult } from '../database/kb-domain.types';
import { FilterClientInput } from '../schema/clients/FilterClientSchema';

@injectable()
export class ClientRepository implements IClientRepository {
  private get repo() {
    return AppDataSource.manager.getRepository(Client);
  }

  async create(data: Partial<KbClient>): Promise<KbClient> {
    const client = this.repo.create(data as Partial<Client>);
    return this.repo.save(client) as Promise<KbClient>;
  }

  async findAll(): Promise<KbClient[]> {
    return this.repo.find({ order: { client_name: 'ASC' } }) as Promise<KbClient[]>;
  }

  async findAllWithUserId(userId: string): Promise<KbClient[]> {
    return AppDataSource.manager
      .createQueryBuilder(Client, 'client')
      .innerJoin('client.users', 'user', 'user.user_id = :userId', { userId })
      .orderBy('client.client_name', 'ASC')
      .getMany() as Promise<KbClient[]>;
  }

  async findAllByRegionOrdered(region: string): Promise<KbClient[]> {
    return this.repo.find({
      where: { region },
      order: { createdAt: 'DESC' },
    }) as Promise<KbClient[]>;
  }

  async findById(id: string): Promise<KbClient | null> {
    return this.repo.findOne({ where: { client_id: id } }) as Promise<KbClient | null>;
  }

  async findByIds(ids: string[]): Promise<KbClient[]> {
    if (ids.length === 0) return [];
    const { In } = await import('typeorm');
    return this.repo.find({ where: { client_id: In(ids) } }) as Promise<KbClient[]>;
  }

  async findBySharedId(sharedId: string): Promise<KbClient | null> {
    return this.repo.findOne({ where: { client_shared_id: sharedId } }) as Promise<KbClient | null>;
  }

  async findIMClient(): Promise<KbClient | null> {
    return this.repo.findOne({ where: { is_im: true } }) as Promise<KbClient | null>;
  }

  async findFLXClient(): Promise<KbClient | null> {
    return this.repo.findOne({ where: { is_flx: true } }) as Promise<KbClient | null>;
  }

  async findByName(name: string): Promise<KbClient | null> {
    return this.repo.findOne({ where: { client_name: name } }) as Promise<KbClient | null>;
  }

  async save(client: KbClient): Promise<KbClient> {
    return this.repo.save(client as Client) as Promise<KbClient>;
  }

  async addUserAccess(clientId: string, userId: string): Promise<void> {
    await AppDataSource.manager
      .createQueryBuilder()
      .relation(Client, 'users')
      .of(clientId)
      .add(userId);
  }

  async findAndCountAllFiltered(input: FilterClientInput): Promise<PaginatedKbClientResult> {
    const { search, entity, page, limit } = input;

    const where: Record<string, unknown> = {};
    if (search) where['client_name'] = ILike(`%${search}%`);
    if (entity) where['entity'] = entity;

    const [clients, total] = await this.repo.findAndCount({
      where,
      order: { client_name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { clients: clients as KbClient[], total };
  }
}
