import { injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { ITrainingTopicRepository } from '../interfaces/trainingTopics/trainingTopic.repository.interface';
import { TrainingTopic } from '../entities/TrainingTopic.entity';
import ES from '../../../../shared/types/enum/ES';
import { In } from 'typeorm';

@injectable()
export class TrainingTopicRepository implements ITrainingTopicRepository {
  async create(topic: TrainingTopic): Promise<TrainingTopic> {
    return await AppDataSource.manager.save(topic);
  }

  async findAll(courseId: string): Promise<TrainingTopic[]> {
    return await AppDataSource.manager.find(TrainingTopic, {
      where: {
        course_id: courseId,
      },
    });
  }

  async findById(id: string): Promise<TrainingTopic | null> {
    return await AppDataSource.manager.findOne(TrainingTopic, {
      where: {
        topic_id: id,
      },
    });
  }

  async findByName(topicName: string): Promise<TrainingTopic | null> {
    return await AppDataSource.manager.findOne(TrainingTopic, {
      where: {
        topic_name: topicName,
      },
    });
  }

  async findActiveTopicsGroupedByCourse(
    courseIds: string[],
  ): Promise<Map<string, TrainingTopic[]>> {
    const groupedTopics = new Map<string, TrainingTopic[]>();
    if (!courseIds || courseIds.length === 0) return groupedTopics;

    // fetch active topics for the specified courses
    const trainingTopics = await AppDataSource.manager.find(TrainingTopic, {
      where: {
        course_id: In(courseIds),
        topic_status: ES.ACTIVE,
      },
      order: {
        course_id: 'ASC',
      },
    });


    // group the results by course_id
    for (const topic of trainingTopics) {
      if (!groupedTopics.has(topic.course_id)) {
        groupedTopics.set(topic.course_id, []);
      }
      groupedTopics.get(topic.course_id)!.push(topic);
    }

    return groupedTopics;
  }

  async findByCourseId(courseId: string): Promise<TrainingTopic[]> {
    return await AppDataSource.manager.find(TrainingTopic, {
      where: {
        course_id: courseId,
      },
    });
  }

  async save(topic: TrainingTopic): Promise<TrainingTopic> {
    return await AppDataSource.manager.save(topic);
  }
}
