import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { TrainingTopicController } from '../controllers/trainingTopics.controller';

const topicController = container.get<TrainingTopicController>(
  TrainingTopicController,
);

const topicRouter = Router();

topicRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await topicController.createTopic(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

topicRouter.get(
  '/course/:courseId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await topicController.getTopics(req, res);
    } catch (error) {
      next(error);
    }
  },
);

topicRouter.get(
  '/course/:courseId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await topicController.getTopics(req, res);
    } catch (error) {
      next(error);
    }
  },
);

topicRouter.get(
  '/:topicId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await topicController.getTopicById(req, res);
    } catch (error) {
      next(error);
    }
  },
);

topicRouter.get(
  '/:topicId/classes/published/user/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await topicController.getPublishedClassesForUser(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

topicRouter.put(
  '/:topicId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await topicController.updateTopic(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export { topicRouter };
