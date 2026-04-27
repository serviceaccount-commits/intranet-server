import { CourseUserValue } from '../../entities/CourseUserValue.entity';

export interface ICourseUserValueRepository {
  findByCourseId(courseId: string, users: boolean): Promise<CourseUserValue[]>;
  findByCourseIdAndUserId(
    courseId: string,
    userId: string,
  ): Promise<CourseUserValue | null>;
  findByUserId(userId: string): Promise<CourseUserValue[]>;

  save(value: CourseUserValue): Promise<CourseUserValue>;
  saveMany(values: CourseUserValue[]): Promise<CourseUserValue[]>;
}
