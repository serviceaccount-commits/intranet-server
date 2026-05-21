import { KbTopic } from '../../database/kb-domain.types';

export interface ITopicRepository {
  create(data: Partial<KbTopic>): Promise<KbTopic>;
  findAll(): Promise<KbTopic[]>;
  findAllByClientId(clientId: string): Promise<KbTopic[]>;
  findAllByClientIds(clientIds: string[]): Promise<KbTopic[]>;
  findById(id: string): Promise<KbTopic | null>;
  findByName(name: string): Promise<KbTopic | null>;
  save(topic: KbTopic): Promise<KbTopic>;
  /** Returns descendants only (excludes the root). */
  findAllDescendantIds(rootTopicId: string): Promise<string[]>;
}
