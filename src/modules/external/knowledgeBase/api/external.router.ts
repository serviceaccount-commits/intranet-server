import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { ArticleController } from '../controllers/articles.controller';

const articleController = container.get<ArticleController>(ArticleController);

const externalRouter = Router();

externalRouter.get(
  '/:clientSharedId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getExternalClientArticles(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

externalRouter.get(
  '/:clientSharedId/:articleId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getExternalClientArticleDetails(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export { externalRouter };
