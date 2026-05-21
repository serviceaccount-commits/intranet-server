import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { TopicController } from '../controllers/topics.controller';

const topicController = container.get<TopicController>(TopicController);

const topicsRouter = Router();

topicsRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await topicController.createTopic(req, res);
    } catch (error) {
      next(error);
    }
  },
);

// TODO: Change route /client/:clientId
topicsRouter.get(
  '/client/:clientId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await topicController.getTopics(req, res);
    } catch (error) {
      next(error);
    }
  },
);

topicsRouter.get(
  '/:topicId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await topicController.getTopicById(req, res);
    } catch (error) {
      next(error);
    }
  },
);

topicsRouter.put(
  '/:topicId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await topicController.updateTopic(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { topicsRouter };
