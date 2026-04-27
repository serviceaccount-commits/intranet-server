import ES from '../../../../../shared/types/enum/ES';
import { Class } from '../../entities/Class.entity';
import { TrainingTopic } from '../../entities/TrainingTopic.entity';
import { CreateTrainingTopicInput } from '../../schema/trainingTopics/CreateTrainingTopicSchema';
import { UpdateTrainingTopicInput } from '../../schema/trainingTopics/UpdateTraingTopicSchema';

export interface ClassWithUserCompletionStatus {
  class: Class;
  userCompletionStatus: ES.COMPLETED | ES.INCOMPLETE;
}

export interface ITrainingTopicService {
  createTopic(input: CreateTrainingTopicInput): Promise<TrainingTopic>;
  updateTopic(
    topicId: string,
    input: UpdateTrainingTopicInput,
  ): Promise<TrainingTopic>;

  getTopics(courseId: string): Promise<TrainingTopic[]>;

  getTopicById(topicId: string): Promise<TrainingTopic>;
  getPublishedClassesWithUserCompletionStatus(
    topicId: string,
    userId: string,
  ): Promise<ClassWithUserCompletionStatus[]>;
}
