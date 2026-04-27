import { injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { ITrainingTopicUserValueRepository } from '../interfaces/trainingTopics/trainingTopicUserValue.repository.interface';
import { TrainingTopicUserValue } from '../entities/TrainingTopicUserValue.entity';

@injectable()
export class TrainingTopicUserValueRepository
  implements ITrainingTopicUserValueRepository
{
  async save(value: TrainingTopicUserValue): Promise<TrainingTopicUserValue> {
    return await AppDataSource.manager.save(value);
  }

  async saveMany(
    values: TrainingTopicUserValue[],
  ): Promise<TrainingTopicUserValue[]> {
    return await AppDataSource.manager.save(values);
  }

  // TODO: find user values but retrieving it for display with filter to only return ACTIVE values

  async findByTopicIdAndUserId(
    topicId: string,
    userId: string,
  ): Promise<TrainingTopicUserValue | null> {
    return await AppDataSource.manager.findOne(TrainingTopicUserValue, {
      where: {
        topic_id: topicId,
        user_id: userId,
      },
    });
  }

  async findByCourseIdAndUserId(
    courseId: string,
    userId: string,
  ): Promise<TrainingTopicUserValue | null> {
    return await AppDataSource.manager.findOne(TrainingTopicUserValue, {
      where: {
        topic: { course_id: courseId },
        user_id: userId,
      },
    });
  }

  async findByTopicId(
    topicId: string,
    users: boolean = false,
  ): Promise<TrainingTopicUserValue[]> {
    if (users) {
      return await AppDataSource.manager.find(TrainingTopicUserValue, {
        where: {
          topic_id: topicId,
        },
        relations: {
          user: true,
        },
      });
    } else {
      return await AppDataSource.manager.find(TrainingTopicUserValue, {
        where: {
          topic_id: topicId,
        },
      });
    }
  }
  async findByUserIdAndCourseIdWithTopic(
    userId: string,
    courseId: string,
  ): Promise<TrainingTopicUserValue[]> {
    return await AppDataSource.manager.find(TrainingTopicUserValue, {
      where: {
        topic: { course_id: courseId },
        user_id: userId,
      },
      relations: {
        topic: true,
        classValues: {
          class: true,
        },
      },
    });
  }

  async findByUserIdAndCourseIds(
    userId: string,
    courseIds: string[],
  ): Promise<TrainingTopicUserValue[]> {
    if (!courseIds || courseIds.length === 0) return [];

    // --- Manual Placeholder Strategy for IN Clause ---
    const parameters: { [key: string]: any } = { userId }; // Start parameters object with userId
    const placeholders = courseIds
      .map((id, index) => {
        const paramName = `courseId_${index}`; // Create unique names like :courseId_0, :courseId_1
        parameters[paramName] = id; // Add the actual courseId to the parameters object
        return `:${paramName}`; // Return the placeholder string e.g., ':courseId_0'
      })
      .join(', '); // Join them with commas: ':courseId_0, :courseId_1'
    // Resulting placeholders string: ':courseId_0, :courseId_1' (for 2 IDs)
    // Resulting parameters object: { userId: 'user-uuid', courseId_0: 'course-uuid-1', courseId_1: 'course-uuid-2' }

    // --- Query Builder using Manual Placeholders ---
    const queryBuilder = AppDataSource.manager
      .createQueryBuilder(TrainingTopicUserValue, 'tuv')
      .innerJoin('tuv.topic', 'topic')
      // Use the constructed placeholders string and the full parameters object
      .where(
        `tuv.user_id = :userId AND topic.course_id IN (${placeholders})`,
        parameters,
      )
      .select([
        // Select specific columns for efficiency
        'tuv.topic_value_id',
        'tuv.user_id',
        'tuv.topic_id',
        'tuv.completed_classes_count',
        'tuv.total_classes_count',
        // Add tuv.course_value_id if it exists and is needed
      ]);
    // Optionally add back if the service layer needs the full topic object:
    // .leftJoinAndSelect('tuv.topic', 'relatedTopic');

    return await queryBuilder.getMany();
  }
}
