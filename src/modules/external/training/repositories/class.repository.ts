import { injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { Class } from '../entities/Class.entity';
import { IClassRepository } from '../interfaces/classes/class.repository.interface';
import ES from '../../../../shared/types/enum/ES';
import { In } from 'typeorm';

@injectable()
export class ClassRepository implements IClassRepository {
  async create(trainingClass: Class): Promise<Class> {
    return AppDataSource.manager.save(trainingClass);
  }

  async save(trainingClass: Class): Promise<Class> {
    return AppDataSource.manager.save(trainingClass);
  }

  async findAll(): Promise<Class[]> {
    return await AppDataSource.manager.find(Class);
  }

  async findById(id: string): Promise<Class | null> {
    return await AppDataSource.manager.findOne(Class, {
      where: {
        class_id: id,
      },
      relations: {
        user: true,
        comments: true,
        topic: true,
        exams: true,
      },
    });
  }

  async findByTopicId(topicId: string): Promise<Class[]> {
    return await AppDataSource.manager.find(Class, {
      where: {
        topic_id: topicId,
      },
      relations: {
        user: true,
        comments: true,
      },
    });
  }

  async findClassesGroupedByTopic(
    topicIds: string[],
  ): Promise<Map<string, Class[]>> {
    const groupedClasses = new Map<string, Class[]>();
    if (!topicIds || topicIds.length === 0) return groupedClasses;

    const classes = await AppDataSource.manager.find(Class, {
      where: {
        topic_id: In(topicIds),
      },
      order: {
        topic_id: 'ASC',
      },
    });

    for (const cls of classes) {
      if (!groupedClasses.has(cls.topic_id)) {
        groupedClasses.set(cls.topic_id, []);
      }
      groupedClasses.get(cls.topic_id)!.push(cls);
    }

    return groupedClasses;
  }

  async findByName(articleName: string): Promise<Class | null> {
    return AppDataSource.manager.findOne(Class, {
      where: {
        class_name: articleName,
      },
    });
  }

  async findPublishedByTopic(topicId: string): Promise<Class[]> {
    return await AppDataSource.manager.find(Class, {
      where: {
        topic_id: topicId,
        class_status: ES.PUBLISHED,
      },
      order: {
        class_name: 'DESC',
      },
    });
  }
}
