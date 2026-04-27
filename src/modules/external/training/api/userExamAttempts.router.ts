import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { UserExamAttemptController } from '../controllers/userExamAttempts.controller';

const userExamAttemptController = container.get<UserExamAttemptController>(
  UserExamAttemptController,
);
const userExamAttemptRouter = Router();

userExamAttemptRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await userExamAttemptController.submitExamAnswers(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

userExamAttemptRouter.get(
  '/:attemptId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await userExamAttemptController.getUserExamAnswers(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export { userExamAttemptRouter };
