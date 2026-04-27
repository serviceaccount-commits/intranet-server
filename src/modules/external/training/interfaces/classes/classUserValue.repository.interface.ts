import { ClassUserValue } from '../../entities/ClassUserValue.entity';

export interface IClassUserValueRepository {
  findByClassId(classId: string, users: boolean): Promise<ClassUserValue[]>;
  findByClassIdAndUserId(
    classId: string,
    userId: string,
  ): Promise<ClassUserValue | null>;
  findByTopicIdAndUserId(
    topicId: string,
    userId: string,
  ): Promise<ClassUserValue | null>;
  findByUserIdAndClassIds(
    userId: string,
    classIds: string[],
  ): Promise<ClassUserValue[]>;

  save(value: ClassUserValue): Promise<ClassUserValue>;
  saveMany(values: ClassUserValue[]): Promise<ClassUserValue[]>;
}
