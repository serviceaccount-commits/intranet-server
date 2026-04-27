import { TrainingTopicUserValue } from '../../entities/TrainingTopicUserValue.entity';

export interface ITrainingTopicUserValueRepository {
  findByTopicId(
    topicId: string,
    users: boolean,
  ): Promise<TrainingTopicUserValue[]>;
  findByTopicIdAndUserId(
    topicId: string,
    userId: string,
  ): Promise<TrainingTopicUserValue | null>;
  findByUserIdAndCourseIds(
    userId: string,
    courseIds: string[],
  ): Promise<TrainingTopicUserValue[]>;
  findByUserIdAndCourseIdWithTopic(
    userId: string,
    courseId: string,
  ): Promise<TrainingTopicUserValue[]>;

  save(value: TrainingTopicUserValue): Promise<TrainingTopicUserValue>;
  saveMany(values: TrainingTopicUserValue[]): Promise<TrainingTopicUserValue[]>;
}
