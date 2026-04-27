import { Course } from '../../entities/Course.entity';

export interface ICourseRepository {
  create(course: Course): Promise<Course>;

  findAll(withUserValues: boolean): Promise<Course[]>;

  findById(id: string): Promise<Course | null>;
  findByIds(ids: string[]): Promise<Course[]>;

  findByName(courseName: string): Promise<Course | null>;
  findAllByAuthorId(userId: string): Promise<Course[]>;

  save(course: Course): Promise<Course>;
}
