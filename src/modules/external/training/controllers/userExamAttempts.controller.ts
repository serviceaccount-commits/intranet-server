import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IUserExamAttemptService } from '../interfaces/userExamAttempts/userExamAttempt.service.interface';
import { CreateUserExamAttemptInput } from '../schema/userExamAttempts/CreateUserExamAttemptSchema';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../../../shared/errors/AppError';

@injectable()
export class UserExamAttemptController {
  constructor(
    @inject(TYPES.IUserExamAttemptService)
    private userExamAttemptService: IUserExamAttemptService,
  ) {}

  async submitExamAnswers(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateUserExamAttemptInput = req.body;
      const userId = req.user?.id;
      if (!userId) return res.sendStatus(401);

      const exam = await this.userExamAttemptService.submitExamAnswers(input, userId);
      res.status(201).json(exam);
    } catch (error) {
      if (error instanceof ZodError) return res.status(400).json({ error });
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async getUserExamAnswers(req: Request, res: Response, next: NextFunction) {
    try {
      const { attemptId } = req.params;
      if (!attemptId) return res.sendStatus(400);

      const examWithUserAnswers = await this.userExamAttemptService.getUserExamAnswers(attemptId);
      res.status(200).json(examWithUserAnswers);
    } catch (error) {
      if (error instanceof ZodError) return res.status(400).json({ error });
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }
}
