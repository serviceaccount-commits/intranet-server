import { UserAnswer } from '../../entities/UserAnswers.entity';

export interface IUserAnswerRepository {
  create(userAnswer: UserAnswer): Promise<UserAnswer>;
  findByAttemptId(attemptId: string): Promise<UserAnswer[]>;
}
