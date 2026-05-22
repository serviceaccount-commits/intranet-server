import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { ArticleController } from '../controllers/articles.controller';

const articleController = container.get<ArticleController>(ArticleController);

const externalTopicsRouter = Router();

externalTopicsRouter.get(
  '/:clientSharedId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getExternalClientTopics(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export { externalTopicsRouter };
