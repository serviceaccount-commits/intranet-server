import { KbTopic, KbTopicAccessUser } from '../../database/kb-domain.types';
import { CreateTopicInput } from '../../schema/topics/CreateTopicSchema';
import { UpdateTopicInput } from '../../schema/topics/UpdateTopicSchema';
import {
  CreateManagedTopicInput,
  UpdateManagedTopicInput,
} from '../../schema/manage/ManagedTopicSchemas';

export interface ITopicService {
  createTopic(input: CreateTopicInput): Promise<KbTopic>;
  updateTopic(input: UpdateTopicInput): Promise<KbTopic>;
  createManagedTopic(
    clientSharedId: string,
    input: CreateManagedTopicInput,
  ): Promise<KbTopic>;
  updateManagedTopic(
    clientSharedId: string,
    topicId: string,
    input: UpdateManagedTopicInput,
  ): Promise<KbTopic>;
  deleteManagedTopic(clientSharedId: string, topicId: string): Promise<void>;
  getTopics(clientId: string, userId: string): Promise<KbTopic[]>;
  getTopicById(topicId: string, userId: string): Promise<KbTopic>;
  getTopicContents(topicId: string, userId: string): Promise<{ subfolders: number; articles: number }>;
  deleteTopic(topicId: string, userId: string): Promise<{ subfolders: number; articles: number }>;
  getTopicAccess(
    topicId: string,
    userId: string,
  ): Promise<{ restricted: boolean; allowed: KbTopicAccessUser[]; staff: KbTopicAccessUser[] }>;
  setTopicAccess(topicId: string, userIds: string[], userId: string): Promise<void>;
}
