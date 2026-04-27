import { UserExamAttempt } from '../../entities/UserExamAttempts.entity';
import { UserExamAttemptDashboardResult } from '../../types/Training.types';

export interface IUserExamAttemptRepository {
  create(userExamAttempt: UserExamAttempt): Promise<UserExamAttempt>;

  findByUserIdAndClassId(
    userId: string,
    classId: string,
  ): Promise<UserExamAttempt[]>;

  findByUserIdAndExamId(
    userId: string,
    examId: string,
  ): Promise<UserExamAttempt[]>;
  findAllActiveByUserIdAndExamId(
    userId: string,
    examId: string,
  ): Promise<UserExamAttemptDashboardResult[]>;
  findById(id: string): Promise<UserExamAttempt | null>;

  findAllActive(): Promise<UserExamAttemptDashboardResult[]>;
}
