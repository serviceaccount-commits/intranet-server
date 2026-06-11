import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { ManageArticlesController } from '../controllers/manage-articles.controller';

const manageArticlesController = container.get<ManageArticlesController>(
  ManageArticlesController,
);

const manageArticlesRouter = Router();

manageArticlesRouter.post(
  '/:clientSharedId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await manageArticlesController.createArticle(req, res);
    } catch (error) {
      next(error);
    }
  },
);

manageArticlesRouter.put(
  '/:clientSharedId/:versionId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await manageArticlesController.updateArticle(req, res);
    } catch (error) {
      next(error);
    }
  },
);

manageArticlesRouter.delete(
  '/:clientSharedId/:versionId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await manageArticlesController.archiveArticle(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { manageArticlesRouter };
