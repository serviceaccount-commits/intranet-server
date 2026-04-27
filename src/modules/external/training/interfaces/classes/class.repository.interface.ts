import { Class } from '../../entities/Class.entity';

export interface IClassRepository {
  create(trainingClass: Class): Promise<Class>;

  save(trainingClass: Class): Promise<Class>;

  findAll(): Promise<Class[]>;
  findByTopicId(topicId: string): Promise<Class[]>;

  findById(id: string): Promise<Class | null>;
  findByName(articleName: string): Promise<Class | null>;
  findPublishedByTopic(topicId: string): Promise<Class[]>;
  findClassesGroupedByTopic(topicIds: string[]): Promise<Map<string, Class[]>>;
}
