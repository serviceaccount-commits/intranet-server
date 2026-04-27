import { UserExamAttempt } from '../../entities/UserExamAttempts.entity';
import { CreateUserExamAttemptInput } from '../../schema/userExamAttempts/CreateUserExamAttemptSchema';
import { UserExamAttemptWithAnswers } from '../../types/Training.types';

export interface IUserExamAttemptService {
  submitExamAnswers(
    input: CreateUserExamAttemptInput,
    userId: string,
  ): Promise<UserExamAttempt>;
  getUserExamAnswers(attemptId: string): Promise<UserExamAttemptWithAnswers>;
}
