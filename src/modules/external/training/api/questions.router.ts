import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { QuestionController } from '../controllers/questions.controller';

const questionController =
  container.get<QuestionController>(QuestionController);
const questionRouter = Router();

questionRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await questionController.createQuestion(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

questionRouter.put(
  '/:questionId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await questionController.updateQuestion(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

questionRouter.delete(
  '/:questionId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await questionController.deleteQuestion(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export { questionRouter };
