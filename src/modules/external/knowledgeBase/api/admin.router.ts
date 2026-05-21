import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { ArticleController } from '../controllers/articles.controller';

const articleController = container.get<ArticleController>(ArticleController);

const adminRouter = Router();

adminRouter.get(
  '/:clientSharedId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getAdminClientArticles(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.get(
  '/:clientSharedId/:articleId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getAdminClientArticleDetails(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export { adminRouter };
