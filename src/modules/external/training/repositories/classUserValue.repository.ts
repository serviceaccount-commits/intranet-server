import { injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { IClassUserValueRepository } from '../interfaces/classes/classUserValue.repository.interface';
import { ClassUserValue } from '../entities/ClassUserValue.entity';
import { In } from 'typeorm';

@injectable()
export class ClassUserValueRepository implements IClassUserValueRepository {
  async save(value: ClassUserValue): Promise<ClassUserValue> {
    return await AppDataSource.manager.save(value);
  }

  async saveMany(values: ClassUserValue[]): Promise<ClassUserValue[]> {
    return await AppDataSource.manager.save(values);
  }

  // TODO: find user values but retrieving it for display with filter to only return ACTIVE values

  async findByClassIdAndUserId(
    classId: string,
    userId: string,
  ): Promise<ClassUserValue | null> {
    return await AppDataSource.manager.findOne(ClassUserValue, {
      where: {
        class_id: classId,
        user_id: userId,
      },
      relations: {
        topicValue: true,
      },
    });
  }

  async findByTopicIdAndUserId(
    topicId: string,
    userId: string,
  ): Promise<ClassUserValue | null> {
    return await AppDataSource.manager.findOne(ClassUserValue, {
      where: {
        topic_value_id: topicId,
        user_id: userId,
      },
    });
  }

  async findByClassId(
    classId: string,
    users: boolean = false,
  ): Promise<ClassUserValue[]> {
    if (users) {
      return await AppDataSource.manager.find(ClassUserValue, {
        where: {
          class_id: classId,
        },
        relations: {
          user: true,
        },
      });
    } else {
      return await AppDataSource.manager.find(ClassUserValue, {
        where: {
          class_id: classId,
        },
      });
    }
  }

  async findByUserIdAndClassIds(
    userId: string,
    classIds: string[],
  ): Promise<ClassUserValue[]> {
    if (!classIds || classIds.length === 0) return [];

    return await AppDataSource.manager.find(ClassUserValue, {
      where: {
        user_id: userId,
        class_id: In(classIds),
      },
      select: ['class_id', 'user_id', 'completion_status', 'class_value_id'],
    });
  }
}
