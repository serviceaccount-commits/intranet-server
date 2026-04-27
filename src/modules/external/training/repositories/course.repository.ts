import { injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { In } from 'typeorm';
import { ICourseRepository } from '../interfaces/courses/course.repository.interface';
import { Course } from '../entities/Course.entity';

@injectable()
export class CourseRepository implements ICourseRepository {
  async create(course: Course): Promise<Course> {
    return await AppDataSource.manager.save(course);
  }

  async findAll(withUserValues: boolean = false): Promise<Course[]> {
    if (!withUserValues) {
      return await AppDataSource.manager.find(Course, {
        relations: {
          user: true,
        },
      });
    }
    return await AppDataSource.manager.find(Course, {
      relations: {
        user: true,
        userValues: true,
      },
    });
  }

  async findById(id: string): Promise<Course | null> {
    return await AppDataSource.manager.findOne(Course, {
      where: {
        course_id: id,
      },
      relations: {
        topics: {
          classes: true,
        },
      },
    });
  }

  async findByIds(ids: string[]): Promise<Course[]> {
    if (!ids || ids.length === 0) return [];
    return await AppDataSource.manager.find(Course, {
      where: {
        course_id: In(ids),
      },
    });
  }

  async findByName(courseName: string): Promise<Course | null> {
    return await AppDataSource.manager.findOne(Course, {
      where: {
        course_name: courseName,
      },
    });
  }

  async findAllByAuthorId(userId: string): Promise<Course[]> {
    return await AppDataSource.manager.find(Course, {
      where: {
        user_id: userId,
      },
    });
  }

  async save(course: Course): Promise<Course> {
    return await AppDataSource.manager.save(course);
  }
}
