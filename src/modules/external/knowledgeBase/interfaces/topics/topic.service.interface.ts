import { KbTopic } from '../../database/kb-domain.types';
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
  getTopics(clientId: string): Promise<KbTopic[]>;
  getTopicById(topicId: string): Promise<KbTopic>;
}
