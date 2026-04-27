import { TrainingTopic } from '../../entities/TrainingTopic.entity';

export interface ITrainingTopicRepository {
  create(topic: TrainingTopic): Promise<TrainingTopic>;

  findAll(courseId: string): Promise<TrainingTopic[]>;

  findById(id: string): Promise<TrainingTopic | null>;
  findByName(topicName: string): Promise<TrainingTopic | null>;
  findActiveTopicsGroupedByCourse(
    courseIds: string[],
  ): Promise<Map<string, TrainingTopic[]>>;
  findByCourseId(courseId: string): Promise<TrainingTopic[]>;
  save(topic: TrainingTopic): Promise<TrainingTopic>;
}
