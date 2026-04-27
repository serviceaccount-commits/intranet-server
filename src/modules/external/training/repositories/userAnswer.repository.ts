import { injectable } from 'inversify';
import { IUserAnswerRepository } from '../interfaces/userAnswers/userAnswer.repository.interface';
import { UserAnswer } from '../entities/UserAnswers.entity';
import { AppDataSource } from '../../../../shared/database/data-source';

@injectable()
export class UserAnswerRepository implements IUserAnswerRepository {
  async create(userAnswer: UserAnswer): Promise<UserAnswer> {
    return await AppDataSource.manager.save(userAnswer);
  }

  async findByAttemptId(attemptId: string): Promise<UserAnswer[]> {
    return await AppDataSource.manager.find(UserAnswer, {
      where: {
        attempt_id: attemptId,
      },
      relations: {
        question: true,
        option: true,
      },
    });
  }
}
