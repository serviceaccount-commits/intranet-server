import { KbTopic, KbTopicAccessUser } from '../../database/kb-domain.types';

export interface ITopicRepository {
  create(data: Partial<KbTopic>): Promise<KbTopic>;
  findAll(): Promise<KbTopic[]>;
  findAllByClientId(clientId: string): Promise<KbTopic[]>;
  findAllByClientIds(clientIds: string[]): Promise<KbTopic[]>;
  findById(id: string): Promise<KbTopic | null>;
  findByName(name: string): Promise<KbTopic | null>;
  save(topic: KbTopic): Promise<KbTopic>;
  deleteById(id: string): Promise<void>;
  /** Returns descendants only (excludes the root). */
  findAllDescendantIds(rootTopicId: string): Promise<string[]>;
  /** Soft-deleted rows included (they keep archived articles reachable). */
  findByIdWithDeleted(id: string): Promise<KbTopic | null>;
  findAllByClientIdsWithDeleted(clientIds: string[]): Promise<KbTopic[]>;
  softDeleteByIds(ids: string[]): Promise<void>;
  restoreByIds(ids: string[]): Promise<void>;
  findAccessByTopicIds(topicIds: string[]): Promise<Map<string, Set<string>>>;
  replaceAccess(topicId: string, userIds: string[]): Promise<void>;
  findClientStaff(clientId: string): Promise<KbTopicAccessUser[]>;
  findUsersByIds(userIds: string[]): Promise<KbTopicAccessUser[]>;
}
