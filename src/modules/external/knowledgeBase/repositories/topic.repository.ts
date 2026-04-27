import { injectable } from 'inversify';
import { In } from 'typeorm';

import { AppDataSource } from '../../../../shared/database/data-source';
import { Topic } from '../entities/Topic.entity';
import { ITopicRepository } from '../interfaces/topics/topic.repository.interface';
import { KbTopic } from '../database/kb-domain.types';

@injectable()
export class TopicRepository implements ITopicRepository {
  private get repo() {
    return AppDataSource.manager.getRepository(Topic);
  }

  async create(data: Partial<KbTopic>): Promise<KbTopic> {
    const topic = this.repo.create(data as Partial<Topic>);
    return this.repo.save(topic) as Promise<KbTopic>;
  }

  async findAll(): Promise<KbTopic[]> {
    return this.repo.find({ order: { topic_name: 'ASC' } }) as Promise<KbTopic[]>;
  }

  async findAllByClientId(clientId: string): Promise<KbTopic[]> {
    return this.repo.find({
      where: { client_id: clientId },
      order: { topic_name: 'ASC' },
    }) as Promise<KbTopic[]>;
  }

  async findAllByClientIds(clientIds: string[]): Promise<KbTopic[]> {
    if (clientIds.length === 0) return [];
    return this.repo.find({ where: { client_id: In(clientIds) } }) as Promise<KbTopic[]>;
  }

  async findById(id: string): Promise<KbTopic | null> {
    return this.repo.findOne({ where: { topic_id: id } }) as Promise<KbTopic | null>;
  }

  async findByName(name: string): Promise<KbTopic | null> {
    return this.repo.findOne({ where: { topic_name: name } }) as Promise<KbTopic | null>;
  }

  async save(topic: KbTopic): Promise<KbTopic> {
    return this.repo.save(topic as Topic) as Promise<KbTopic>;
  }
}
