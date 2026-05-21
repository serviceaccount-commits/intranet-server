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

  /** Returns every topic_id under the given root (root NOT included), walking
   *  the parent_topic_id self-reference recursively. Used to validate cycles
   *  and to power "include subfolders" reads. */
  async findAllDescendantIds(rootTopicId: string): Promise<string[]> {
    const rows: Array<{ topic_id: string }> = await this.repo.query(
      `WITH RECURSIVE descendants AS (
         SELECT topic_id FROM topics WHERE parent_topic_id = $1
         UNION ALL
         SELECT t.topic_id FROM topics t
         INNER JOIN descendants d ON t.parent_topic_id = d.topic_id
       )
       SELECT topic_id FROM descendants`,
      [rootTopicId],
    );
    return rows.map((r) => r.topic_id);
  }
}
