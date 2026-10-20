import { injectable } from 'inversify';
import { In } from 'typeorm';

import { AppDataSource } from '../../../../shared/database/data-source';
import { Topic } from '../entities/Topic.entity';
import { TopicUserAccess } from '../entities/TopicUserAccess.entity';
import { ITopicRepository } from '../interfaces/topics/topic.repository.interface';
import { KbTopic, KbTopicAccessUser } from '../database/kb-domain.types';

@injectable()
export class TopicRepository implements ITopicRepository {
  private get repo() {
    return AppDataSource.manager.getRepository(Topic);
  }

  private get accessRepo() {
    return AppDataSource.manager.getRepository(TopicUserAccess);
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

  async findByIdWithDeleted(id: string): Promise<KbTopic | null> {
    return this.repo.findOne({ where: { topic_id: id }, withDeleted: true }) as Promise<KbTopic | null>;
  }

  async findAllByClientIdsWithDeleted(clientIds: string[]): Promise<KbTopic[]> {
    if (clientIds.length === 0) return [];
    return this.repo.find({
      where: { client_id: In(clientIds) },
      withDeleted: true,
    }) as Promise<KbTopic[]>;
  }

  async softDeleteByIds(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.repo.softDelete({ topic_id: In(ids) });
  }

  async restoreByIds(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.repo.restore({ topic_id: In(ids) });
  }

  async findByName(name: string): Promise<KbTopic | null> {
    return this.repo.findOne({ where: { topic_name: name } }) as Promise<KbTopic | null>;
  }

  async save(topic: KbTopic): Promise<KbTopic> {
    return this.repo.save(topic as Topic) as Promise<KbTopic>;
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete({ topic_id: id });
  }

  /** Returns every topic_id under the given root (root NOT included), walking
   *  the parent_topic_id self-reference recursively. Used to validate cycles
   *  and to power "include subfolders" reads. */
  async findAllDescendantIds(rootTopicId: string): Promise<string[]> {
    const rows: Array<{ topic_id: string }> = await this.repo.query(
      `WITH RECURSIVE descendants AS (
         SELECT topic_id FROM topics
         WHERE parent_topic_id = $1 AND deleted_at IS NULL
         UNION ALL
         SELECT t.topic_id FROM topics t
         INNER JOIN descendants d ON t.parent_topic_id = d.topic_id
         WHERE t.deleted_at IS NULL
       )
       SELECT topic_id FROM descendants`,
      [rootTopicId],
    );
    return rows.map((r) => r.topic_id);
  }

  // ─── Per-folder staff access ──────────────────────────────────────────────────

  /** topic_id → user_ids allowed, for every restricted topic among `topicIds`.
   *  Topics missing from the map are unrestricted. */
  async findAccessByTopicIds(topicIds: string[]): Promise<Map<string, Set<string>>> {
    const map = new Map<string, Set<string>>();
    if (topicIds.length === 0) return map;
    const rows = await this.accessRepo.find({ where: { topic_id: In(topicIds) } });
    for (const row of rows) {
      if (!map.has(row.topic_id)) map.set(row.topic_id, new Set());
      map.get(row.topic_id)!.add(row.user_id);
    }
    return map;
  }

  /** Replaces the folder's allow-list; an empty list lifts the restriction. */
  async replaceAccess(topicId: string, userIds: string[]): Promise<void> {
    await AppDataSource.manager.transaction(async (manager) => {
      await manager.delete(TopicUserAccess, { topic_id: topicId });
      if (userIds.length > 0) {
        await manager.insert(
          TopicUserAccess,
          userIds.map((user_id) => ({ topic_id: topicId, user_id })),
        );
      }
    });
  }

  /** Active staff with access to the client (user_clients), A→Z. */
  async findClientStaff(clientId: string): Promise<KbTopicAccessUser[]> {
    return this.repo.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.work_email
         FROM user_clients uc
         INNER JOIN users u ON u.user_id = uc.user_id
        WHERE uc.client_id = $1 AND u.status = 'active'
        ORDER BY u.first_name, u.last_name`,
      [clientId],
    );
  }

  async findUsersByIds(userIds: string[]): Promise<KbTopicAccessUser[]> {
    if (userIds.length === 0) return [];
    return this.repo.query(
      `SELECT user_id, first_name, last_name, work_email
         FROM users WHERE user_id = ANY($1::uuid[])
        ORDER BY first_name, last_name`,
      [userIds],
    );
  }
}
