import { injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { ICourseUserValueRepository } from '../interfaces/courses/courseUserValue.repository.interface';
import { CourseUserValue } from '../entities/CourseUserValue.entity';
import ES from '../../../../shared/types/enum/ES';

@injectable()
export class CourseUserValueRepository implements ICourseUserValueRepository {
  async save(courseUserValue: CourseUserValue): Promise<CourseUserValue> {
    return await AppDataSource.manager.save(courseUserValue);
  }

  async saveMany(values: CourseUserValue[]): Promise<CourseUserValue[]> {
    return await AppDataSource.manager.save(values);
  }

  // TODO: find user values but retrieving it for display with filter to only return ACTIVE values

  async findByCourseIdAndUserId(
    courseId: string,
    userId: string,
  ): Promise<CourseUserValue | null> {
    return await AppDataSource.manager.findOne(CourseUserValue, {
      where: {
        course_id: courseId,
        user_id: userId,
      },
    });
  }

  async findByCourseId(
    courseId: string,
    users: boolean = false,
  ): Promise<CourseUserValue[]> {
    if (users) {
      return await AppDataSource.manager.find(CourseUserValue, {
        where: {
          course_id: courseId,
        },
        relations: {
          user: true,
        },
      });
    } else {
      return await AppDataSource.manager.find(CourseUserValue, {
        where: {
          course_id: courseId,
        },
      });
    }
  }

  async findByUserId(userId: string): Promise<CourseUserValue[]> {
    return await AppDataSource.manager.find(CourseUserValue, {
      where: {
        user_id: userId,
        user_availability_status: ES.ACTIVE,
      },
      relations: {
        course: true,
        topicValues: true,
      },
    });
  }
}
