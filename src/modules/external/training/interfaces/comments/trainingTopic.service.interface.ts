import { TrainingTopic } from '../../entities/TrainingTopic.entity';
import { CreateTrainingTopicInput } from '../../schema/trainingTopics/CreateTrainingTopicSchema';
import { UpdateTrainingTopicInput } from '../../schema/trainingTopics/UpdateTraingTopicSchema';

export interface ITraningTopicService {
  createTopic(input: CreateTrainingTopicInput): Promise<TrainingTopic>;
  updateTopic(input: UpdateTrainingTopicInput): Promise<TrainingTopic>;

  getTopics(): Promise<TrainingTopic[]>;

  getTopicById(topicId: string): Promise<TrainingTopic>;
}
