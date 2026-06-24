import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { ArticleController } from '../controllers/articles.controller';

const articleController = container.get<ArticleController>(ArticleController);

const articlesRouter = Router();

articlesRouter.get(
  '/search',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.searchArticles(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.createArticle(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.post(
  '/version',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.createVersion(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/:articleId/name',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.updateArticleName(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/:articleId/synopsis',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.updateArticleSynopsis(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/:articleId/generate-ai-synopsis',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.generateAISynopsis(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/:articleId/save-content',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.updateArticleContent(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.post(
  '/:articleId/save-content',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.updateArticleContent(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/:articleId/start-edit',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.startArticleEdit(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.get(
  '/:articleId/lock-available',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getArticleLockInfo(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/:articleId/refresh-edit-lock',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.refreshArticleEditLock(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/unpublish-versions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.unpublishVersions(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/publish-versions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.publishVersions(req, res);
    } catch (error) {
      next(error);
    }
  },
);
articlesRouter.put(
  '/:articleId/publish',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.publishVersion(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/:articleId/unpublish',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.unpublishVersion(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/:articleId/availability',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.updateArticleAvailability(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/:articleId/ai-availability',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.updateArticleAiAvailability(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/:articleId/property',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.updateArticleProperty(req, res);
    } catch (error) {
      next(error);
    }
  },
);

// ── Client copy (dual view): keyed by the current internal version id ─────────
articlesRouter.get(
  '/:articleId/client-copy',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getArticleClientCopy(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/:articleId/client-copy',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.saveArticleClientCopy(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.post(
  '/:articleId/client-copy/regenerate',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.regenerateArticleClientCopy(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/move/:topicId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.moveArticleToTopic(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.put(
  '/:articleId/close-edit-mode',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.closeArticleEdit(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.post(
  '/:articleId/close-edit-mode',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.closeArticleEdit(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.get(
  '/filters',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getArticlesFiltered(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.get(
  '/filters/client/:clientId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getArticlesFilteredByClientId(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.get(
  '/external/shared-client/:sharedClientId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getArticlesFilteredByClientId(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.get(
  '/filters/topic/:topicId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getArticlesFilteredByTopicId(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.get(
  '/latests',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getLatestArticlesForUser(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.get(
  '/topic/:topicId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getArticles(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.get(
  '/:articleId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getArticleById(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.get(
  '/:articleId/document',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getArticleDocumentById(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.get(
  '/:articleId/versions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.getArticleVersions(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.post(
  '/:articleId/tags/:tagId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.addTagToArticle(req, res);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.delete(
  '/:articleId/tags/:tagId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await articleController.removeTagFromArticle(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { articlesRouter };
