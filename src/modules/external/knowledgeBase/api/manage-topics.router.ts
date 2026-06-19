import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { ManageTopicsController } from '../controllers/manage-topics.controller';

const manageTopicsController = container.get<ManageTopicsController>(
  ManageTopicsController,
);

const manageTopicsRouter = Router();

manageTopicsRouter.post(
  '/:clientSharedId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await manageTopicsController.createTopic(req, res);
    } catch (error) {
      next(error);
    }
  },
);

manageTopicsRouter.put(
  '/:clientSharedId/:topicId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await manageTopicsController.updateTopic(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { manageTopicsRouter };
