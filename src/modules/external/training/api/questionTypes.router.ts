import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { QuestionTypeController } from '../controllers/questionTypes.controller';

const questionTypesController = container.get<QuestionTypeController>(
  QuestionTypeController,
);
const questionTypesRouter = Router();

questionTypesRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await questionTypesController.createQuestionType(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export { questionTypesRouter };
