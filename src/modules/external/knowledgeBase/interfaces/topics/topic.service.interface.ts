import { KbTopic } from '../../database/kb-domain.types';
import { CreateTopicInput } from '../../schema/topics/CreateTopicSchema';
import { UpdateTopicInput } from '../../schema/topics/UpdateTopicSchema';

export interface ITopicService {
  createTopic(input: CreateTopicInput): Promise<KbTopic>;
  updateTopic(input: UpdateTopicInput): Promise<KbTopic>;
  getTopics(clientId: string): Promise<KbTopic[]>;
  getTopicById(topicId: string): Promise<KbTopic>;
}
