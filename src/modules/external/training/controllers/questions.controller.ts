import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IQuestionService } from '../interfaces/questions/question.service.interface';
import { Request, Response, NextFunction } from 'express';
import { CreateQuestionInput } from '../schema/questions/CreateQuestionSchema';
import { ZodError } from 'zod';
import { AppError } from '../../../../shared/errors/AppError';
import { UpdateQuestionInput } from '../schema/questions/UpdateQuestionSchema';

@injectable()
export class QuestionController {
  constructor(
    @inject(TYPES.IQuestionService) private questionService: IQuestionService,
  ) {}

  async createQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateQuestionInput = req.body;

      const question = await this.questionService.createQuestion(input);

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

  async updateQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const input: UpdateQuestionInput = req.body;
      const { questionId } = req.params;

      if (!questionId) {
        res.status(400);
        return;
      }

      const question = await this.questionService.updateQuestion(
        questionId,
        input,
      );

      res.status(200).json(question);
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

  async deleteQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId } = req.params;

      if (!questionId) {
        res.status(400);
        return;
      }

      await this.questionService.deleteQuestion(questionId);

      res.status(200).json({ message: 'Option deleted successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }
}
