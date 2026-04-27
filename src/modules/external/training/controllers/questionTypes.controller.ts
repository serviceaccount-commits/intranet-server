import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { Request, Response, NextFunction } from 'express';

import { ZodError } from 'zod';
import { AppError } from '../../../../shared/errors/AppError';

import { IQuestionTypeService } from '../interfaces/questionTypes/questionType.service.interface';
import { CreateQuestionTypeInput } from '../schema/questionTypes/CreateQuestionTypeSchema';

@injectable()
export class QuestionTypeController {
  constructor(
    @inject(TYPES.IQuestionTypeService)
    private questionTypeService: IQuestionTypeService,
  ) {}

  async createQuestionType(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateQuestionTypeInput = req.body;

      const question = await this.questionTypeService.createQuestionType(input);

      res.status(201).json(question);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error });
      }
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}
