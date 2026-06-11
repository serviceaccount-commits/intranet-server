import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { ZodError } from 'zod';

import { TYPES } from '../../../../shared/config/containerTypes';
import { IArticleService } from '../interfaces/articles/article.service.interface';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';

/**
 * Write endpoints consumed by the client portal's BACKEND (server-to-server,
 * authenticated with INTERNAL_WRITE_API_KEY). The portal backend is
 * responsible for authenticating its own users and scoping them to their
 * clientSharedId before calling here.
 */
@injectable()
export class ManageArticlesController {
  constructor(
    @inject(TYPES.IArticleService) private articleService: IArticleService,
  ) {}

  async createArticle(req: Request, res: Response) {
    const { clientSharedId } = req.params;
    if (!clientSharedId) {
      res.sendStatus(400);
      return;
    }
    try {
      const article = await this.articleService.createManagedArticle(
        clientSharedId,
        req.body,
      );
      res.status(201).json(article);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateArticle(req: Request, res: Response) {
    const { clientSharedId, versionId } = req.params;
    if (!clientSharedId || !versionId) {
      res.sendStatus(400);
      return;
    }
    try {
      const article = await this.articleService.updateManagedArticle(
        clientSharedId,
        versionId,
        req.body,
      );
      res.json(article);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async archiveArticle(req: Request, res: Response) {
    const { clientSharedId, versionId } = req.params;
    if (!clientSharedId || !versionId) {
      res.sendStatus(400);
      return;
    }
    try {
      const result = await this.articleService.archiveManagedArticle(
        clientSharedId,
        versionId,
      );
      res.json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error instanceof BusinessLogicError) {
      res.status(409).json({ message: error.message });
      return;
    }
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', issues: error.issues });
      return;
    }
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Unexpected error',
    });
  }
}
