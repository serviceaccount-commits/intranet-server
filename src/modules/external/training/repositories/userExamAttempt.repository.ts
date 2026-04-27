import { injectable } from 'inversify';
import { IUserExamAttemptRepository } from '../interfaces/userExamAttempts/userExamAttempt.repository.interface';
import { UserExamAttempt } from '../entities/UserExamAttempts.entity';
import { AppDataSource } from '../../../../shared/database/data-source';
import { UserExamAttemptDashboardResult } from '../types/Training.types';

@injectable()
export class UserExamAttemptRepository implements IUserExamAttemptRepository {
  async create(userExamAttempt: UserExamAttempt): Promise<UserExamAttempt> {
    return await AppDataSource.manager.save(userExamAttempt);
  }

  async findByUserIdAndClassId(
    userId: string,
    classId: string,
  ): Promise<UserExamAttempt[]> {
    return await UserExamAttempt.find({
      where: {
        user_id: userId,
        exam: { class_id: classId },
      },
      relations: {
        exam: true,
        user: true,
      },
      order: {
        attempt_date: 'DESC',
      },
    });
  }

  async findByUserIdAndExamId(
    userId: string,
    examId: string,
  ): Promise<UserExamAttempt[]> {
    return await AppDataSource.manager.find(UserExamAttempt, {
      where: {
        user_id: userId,
        exam_id: examId,
      },
      relations: {
        exam: true,
        user: true,
      },
      order: {
        attempt_date: 'DESC',
      },
    });
  }

  async findAllActive(): Promise<UserExamAttemptDashboardResult[]> {
    const queryBuilder = await AppDataSource.manager
      .createQueryBuilder(UserExamAttempt, 'uExamAttempt')
      .select('uExamAttempt.attempt_id', 'attempt_id')
      .addSelect('uExamAttempt.status', 'status')
      .addSelect('uExamAttempt.score', 'score')
      .addSelect('uExamAttempt.attempt_date', 'attempt_date')

      .leftJoin('uExamAttempt.user', 'user')
      .addSelect('user.user_id', 'user_id')
      .addSelect('user.first_name', 'first_name')
      .addSelect('user.last_name', 'last_name')

      .leftJoin('uExamAttempt.exam', 'exam')
      .addSelect('exam.exam_id', 'exam_id')
      .addSelect('exam.version', 'exam_version')
      .addSelect('exam.max_attempts', 'exam_max_attempts')

      .leftJoin('exam.class', 'class')
      .addSelect('class.class_name', 'class_name')
      .addSelect('class.class_id', 'class_id')

      .leftJoin('class.topic', 'topic')
      .addSelect('topic.topic_name', 'topic_name')

      .leftJoin('topic.course', 'course')
      .addSelect('course.course_name', 'course_name')

      .where('uExamAttempt.isValid = :isValid', { isValid: true })

      .skip(0)
      .take(30);

    const attempts = await queryBuilder
      .orderBy('uExamAttempt.attempt_date', 'DESC')

      .getRawMany();

    return attempts as UserExamAttemptDashboardResult[];
  }

  async findById(id: string): Promise<UserExamAttempt | null> {
    return await AppDataSource.manager.findOne(UserExamAttempt, {
      where: {
        attempt_id: id,
      },
      relations: {
        exam: true,
        user: true,
      },
    });
  }

  async findAllActiveByUserIdAndExamId(
    userId: string,
    examId: string,
  ): Promise<UserExamAttemptDashboardResult[]> {
    const queryBuilder = await AppDataSource.manager
      .createQueryBuilder(UserExamAttempt, 'uExamAttempt')
      .select('uExamAttempt.attempt_id', 'attempt_id')
      .addSelect('uExamAttempt.status', 'status')
      .addSelect('uExamAttempt.score', 'score')
      .addSelect('uExamAttempt.attempt_date', 'attempt_date')

      .leftJoin('uExamAttempt.user', 'user', 'user.user_id = :userId')
      .addSelect('user.user_id', 'user_id')
      .addSelect('user.first_name', 'first_name')
      .addSelect('user.last_name', 'last_name')

      .leftJoin('uExamAttempt.exam', 'exam', 'exam.exam_id = :examId')
      .addSelect('exam.exam_id', 'exam_id')
      .addSelect('exam.version', 'exam_version')
      .addSelect('exam.max_attempts', 'exam_max_attempts')

      .leftJoin('exam.class', 'class')
      .addSelect('class.class_name', 'class_name')
      .addSelect('class.class_id', 'class_id')

      .leftJoin('class.topic', 'topic')
      .addSelect('topic.topic_name', 'topic_name')

      .leftJoin('topic.course', 'course')
      .addSelect('course.course_name', 'course_name')

      // .where('uExamAttempt.isValid = :isValid', { isValid: true })
      .andWhere('uExamAttempt.user_id = :userId', { userId })
      .andWhere('uExamAttempt.exam_id = :examId', { examId });

    const attempts = await queryBuilder
      .orderBy('uExamAttempt.attempt_date', 'ASC')

      .getRawMany();

    return attempts as UserExamAttemptDashboardResult[];
  }
}
