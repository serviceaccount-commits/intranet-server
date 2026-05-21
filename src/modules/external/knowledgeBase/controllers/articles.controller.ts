import { NextFunction, Request, Response } from 'express';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IArticleService } from '../interfaces/articles/article.service.interface';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import { FilterArticleSchema } from '../schema/articles/FilterArticleSchema';
import { ZodError } from 'zod';
import { AppError } from '../../../../shared/errors/AppError';
import { MoveArticleInput } from '../schema/clients/MoveArticleSchema';
import { CreateVersionInput } from '../schema/articles/CreateVersionSchema';
import { ArticleSearchService } from '../services/articleSearch.service';
import { ArticleStatus } from '../database/kb-domain.types';

@injectable()
export class ArticleController {
  constructor(
    @inject(TYPES.IArticleService) private articleService: IArticleService,
    @inject(TYPES.IArticleSearchService) private searchService: ArticleSearchService,
  ) {}

  async searchArticles(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.sendStatus(401);
      return;
    }

    const q = typeof req.query['q'] === 'string' ? req.query['q'] : '';
    if (!q.trim()) {
      res.json({ hits: [] });
      return;
    }

    const limitRaw = typeof req.query['limit'] === 'string' ? parseInt(req.query['limit'], 10) : NaN;
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20;

    const statusesParam = typeof req.query['statuses'] === 'string' ? req.query['statuses'] : '';
    const statuses = statusesParam
      ? statusesParam.split(',').map((s) => s.trim()).filter(Boolean) as ArticleStatus[]
      : undefined;

    try {
      const hits = await this.searchService.search(q, { limit, statuses });
      res.json({ hits });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  async createArticle(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.sendStatus(400);
      return;
    }

    let { articleName, topicId, articleContent } = req.body;

    const article = await this.articleService.createArticle(
      articleName,
      articleContent,
      topicId,
      userId,
    );

    return res.json(article);
  }

  async createVersion(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.sendStatus(400);
      return;
    }

    const input: CreateVersionInput = req.body;

    const article = await this.articleService.createVersion(input, userId);

    return res.json(article);
  }

  async updateArticleName(req: Request, res: Response) {
    const { articleId } = req.params;
    const { articleName } = req.body;

    if (!articleId || !articleName) {
      res.sendStatus(400);
      return;
    }

    try {
      await this.articleService.updateArticleName(articleId, articleName);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({ error });
    }
  }

  async updateArticleSynopsis(req: Request, res: Response) {
    const { articleId } = req.params;
    const { articleSynopsis } = req.body;

    if (!articleId || !articleSynopsis) {
      res.sendStatus(400);
      return;
    }

    try {
      await this.articleService.updateArticleSynopsis(
        articleId,
        articleSynopsis,
      );
      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({ error });
    }
  }

  async generateAISynopsis(req: Request, res: Response) {
    const { articleId } = req.params;
    const userId = req.user?.id;

    if (!articleId || !userId) {
      res.sendStatus(400);
      return;
    }

    try {
      const article = await this.articleService.generateAISynopsis(articleId);
      res.json(article);
    } catch (error) {
      res.status(400).json({ error });
    }
  }

  async updateArticleContent(req: Request, res: Response) {
    const { articleId } = req.params;
    const { articleContent } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.sendStatus(400);
      return;
    }

    if (!articleId || articleContent === undefined) {
      res.sendStatus(400);
      return;
    }

    try {
      await this.articleService.updateArticleContent(
        articleId,
        articleContent,
        userId,
      );
      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({ error });
    }
  }

  async moveArticleToTopic(req: Request, res: Response) {
    const input: MoveArticleInput = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.sendStatus(400);
      return;
    }

    try {
      await this.articleService.moveArticleToTopic(input, userId);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({ error });
    }
  }

  async startArticleEdit(req: Request, res: Response) {
    const { articleId } = req.params;
    const userId = req.user?.id;

    if (!articleId || !userId) {
      res.sendStatus(400);
      return;
    }

    try {
      await this.articleService.startArticleEdit(userId, articleId);
      res.json({ success: true, message: 'Lock acquired.' });
    } catch (error) {
      if (error instanceof BusinessLogicError) {
        return res.status(403).json({ message: error.message });
      }
      res.status(400).json({ error });
    }
  }

  async refreshArticleEditLock(req: Request, res: Response) {
    const { articleId } = req.params;
    const userId = req.user?.id;

    if (!articleId || !userId) {
      res.sendStatus(400);
      return;
    }

    try {
      await this.articleService.refreshEditLock(userId, articleId);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof BusinessLogicError) {
        return res.status(403).json({ message: error.message });
      }
      res.status(400).json({ error });
    }
  }

  async publishVersion(req: Request, res: Response) {
    const { articleId } = req.params;
    const userId = req.user?.id;

    if (!articleId || !userId) {
      res.sendStatus(400);
      return;
    }

    try {
      const article = await this.articleService.publishVersion(articleId);
      res.json(article);
    } catch (error) {
      if (error instanceof BusinessLogicError) {
        return res.status(403).json({ message: error.message });
      }
      res.status(400).json({ error });
    }
  }

  async unpublishVersion(req: Request, res: Response) {
    const { articleId } = req.params;
    const userId = req.user?.id;

    if (!articleId || !userId) {
      res.sendStatus(400);
      return;
    }

    try {
      const article = await this.articleService.unpublishVersion(articleId);
      res.json(article);
    } catch (error) {
      if (error instanceof BusinessLogicError) {
        return res.status(403).json({ message: error.message });
      }
      res.status(400).json({ error });
    }
  }

  async publishVersions(req: Request, res: Response) {
    const { articleIds } = req.body;
    const userId = req.user?.id;

    if (!articleIds || !userId) {
      res.sendStatus(400);
      return;
    }

    try {
      const article = await this.articleService.publishVersions(
        articleIds as string[],
      );
      res.json(article);
    } catch (error) {
      if (error instanceof BusinessLogicError) {
        return res.status(403).json({ message: error.message });
      }
      res.status(400).json({ error });
    }
  }

  async unpublishVersions(req: Request, res: Response) {
    const { articleIds } = req.body;
    const userId = req.user?.id;

    if (!articleIds || !userId) {
      res.sendStatus(400);
      return;
    }

    try {
      await this.articleService.unpublishVersions(articleIds as string[]);
      res.sendStatus(200);
    } catch (error) {
      if (error instanceof BusinessLogicError) {
        return res.status(403).json({ message: error.message });
      }
      res.status(400).json({ error });
    }
  }

  async closeArticleEdit(req: Request, res: Response) {
    const { articleId } = req.params;
    const userId = req.user?.id;

    if (!articleId || !userId) {
      res.sendStatus(400);
      return;
    }

    try {
      await this.articleService.closeArticleEdit(userId, articleId);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof BusinessLogicError) {
        return res.status(403).json({ message: error.message });
      }
      res.status(400).json({ error });
    }
  }

  async addTagToArticle(req: Request, res: Response) {
    let { articleId } = req.params;

    let { tagName } = req.body;

    if (!articleId) {
      res.sendStatus(400);
      return;
    }
    if (!tagName) {
      res.sendStatus(400);
      return;
    }

    const tag = await this.articleService.addTagToArticle(articleId, tagName);

    return res.json(tag);
  }

  async removeTagFromArticle(req: Request, res: Response) {
    let { articleId, tagId } = req.params;

    if (!articleId || !tagId) {
      res.sendStatus(400);
      return;
    }

    await this.articleService.removeTagFromArticle(articleId, tagId);

    return res.sendStatus(200);
  }

  async getArticles(req: Request, res: Response) {
    const { topicId } = req.params;

    if (!topicId) {
      res.sendStatus(400);
      return;
    }

    const articles = await this.articleService.getArticles(topicId);

    return res.json(articles);
  }

  async getArticlesFiltered(req: Request, res: Response, next: NextFunction) {
    const validationResult = FilterArticleSchema.parse(req.query);
    const userId = req.user?.id;

    if (!userId) {
      res.sendStatus(400);
      return;
    }

    try {
      const result = await this.articleService.findArticles(
        validationResult,
        userId,
      );

      res.status(200).json({
        data: result,
        pagination: {
          totalItems: result.total,
          currentPage: validationResult.page,
          itemsPerPage: validationResult.limit,
          totalPages: Math.ceil(result.total / validationResult.limit),
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error);
      }
      next(error);
    }
  }

  async getArticlesFilteredByClientId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const validationResult = FilterArticleSchema.parse(req.query);
    const { clientId } = req.params;

    const userId = req.user?.id;

    if (!userId) {
      res.sendStatus(400);
      return;
    }

    if (!clientId) {
      res.sendStatus(400);
      return;
    }

    try {
      const result = await this.articleService.findArticlesByClientId(
        clientId,
        validationResult,
        userId,
      );

      res.status(200).json({
        data: result,
        pagination: {
          totalItems: result.total,
          currentPage: validationResult.page,
          itemsPerPage: validationResult.limit,
          totalPages: Math.ceil(result.total / validationResult.limit),
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error);
      }
      next(error);
    }
  }

  async getArticlesFilteredByTopicId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const validationResult = FilterArticleSchema.parse(req.query);
    const { topicId } = req.params;

    if (!topicId) {
      res.sendStatus(400);
      return;
    }

    const userId = req.user?.id;

    if (!userId) {
      res.sendStatus(400);
      return;
    }

    try {
      const result = await this.articleService.findArticlesByTopicId(
        topicId,
        validationResult,
        userId,
      );

      res.status(200).json({
        data: result,
        pagination: {
          totalItems: result.total,
          currentPage: validationResult.page,
          itemsPerPage: validationResult.limit,
          totalPages: Math.ceil(result.total / validationResult.limit),
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error);
      }
      next(error);
    }
  }

  async getLatestArticlesForUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      res.sendStatus(400);
      return;
    }

    try {
      const articles =
        await this.articleService.findLatestArticlesByUserId(userId);

      return res.json(articles);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async getArticleById(req: Request, res: Response) {
    const { articleId } = req.params;

    if (!articleId) {
      res.sendStatus(400);
      return;
    }

    const article = await this.articleService.getArticleWithDetails(articleId);

    return res.json(article);
  }

  async getArticleDocumentById(req: Request, res: Response) {
    const { articleId } = req.params;

    if (!articleId) {
      res.sendStatus(400);
      return;
    }

    const article = await this.articleService.getArticleDocumentById(articleId);

    res.setHeader('Content-Type', 'text/plain');

    res.status(200).send(article);
  }

  async getArticleVersions(req: Request, res: Response) {
    const { articleId } = req.params;

    if (!articleId) {
      res.sendStatus(400);
      return;
    }

    const article =
      await this.articleService.getArticleVersionsByArticleVersionId(articleId);

    res.setHeader('Content-Type', 'text/plain');

    res.status(200).send(article);
  }

  async getExternalClientArticles(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { clientSharedId } = req.params;
    const validationResult = FilterArticleSchema.parse(req.query);

    if (!clientSharedId) {
      res.sendStatus(400);
      return;
    }

    try {
      const articles =
        await this.articleService.findSharedArticlesByClientSharedId(
          validationResult,
          clientSharedId,
        );

      return res.json(articles);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode || 400)
          .json({ message: error.message });
      }
      next(error);
    }
  }

  async getArticleLockInfo(req: Request, res: Response) {
    const { articleId } = req.params;

    if (!articleId) {
      res.sendStatus(400);
      return;
    }

    const article = await this.articleService.getArticleLockInfo(articleId);

    return res.json(article);
  }

  async getExternalClientArticleDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { clientSharedId } = req.params;
    const { articleId } = req.params;

    if (!clientSharedId || !articleId) {
      res.sendStatus(400);
      return;
    }

    try {
      const articles =
        await this.articleService.getArticleByExternalClientAndArticleId(
          clientSharedId,
          articleId,
        );

      return res.json(articles);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode || 400).json({ message: error.message });
      }
      next(error);
    }
  }

  // ─── Admin variants (no `available_for_client` filter) ───────────────────────

  async getAdminClientArticles(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { clientSharedId } = req.params;
    const validationResult = FilterArticleSchema.parse(req.query);

    if (!clientSharedId) {
      res.sendStatus(400);
      return;
    }

    try {
      const articles =
        await this.articleService.findAllPublishedByClientSharedId(
          validationResult,
          clientSharedId,
        );

      return res.json(articles);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode || 400)
          .json({ message: error.message });
      }
      next(error);
    }
  }

  async getAdminClientArticleDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { clientSharedId } = req.params;
    const { articleId } = req.params;

    if (!clientSharedId || !articleId) {
      res.sendStatus(400);
      return;
    }

    try {
      const article =
        await this.articleService.getArticleByExternalClientAndArticleIdAdmin(
          clientSharedId,
          articleId,
        );

      return res.json(article);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode || 400)
          .json({ message: error.message });
      }
      next(error);
    }
  }

  /** Maintenance: backfill chunk embeddings for every published version (or
   *  a specific client's). Use when the search index is incomplete because
   *  articles pre-date the chunker. Long-running: count + log when done. */
  async reindexAllPublishedChunks(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const clientSharedId =
      typeof req.query['clientSharedId'] === 'string'
        ? req.query['clientSharedId']
        : undefined;

    try {
      const result = await this.articleService.reindexAllPublishedChunks(
        clientSharedId,
      );
      return res.json({ ok: true, ...result });
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode || 400)
          .json({ message: error.message });
      }
      next(error);
    }
  }
}
