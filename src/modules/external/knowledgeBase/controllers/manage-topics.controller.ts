import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { ZodError } from 'zod';

import { TYPES } from '../../../../shared/config/containerTypes';
import { ITopicService } from '../interfaces/topics/topic.service.interface';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../../shared/errors/ValidationError';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';

/**
 * Folder (topic) write endpoints consumed by the client portal's BACKEND
 * (server-to-server, authenticated with INTERNAL_WRITE_API_KEY). The portal
 * backend authenticates its own users and scopes them to their clientSharedId
 * before calling here.
 */
@injectable()
export class ManageTopicsController {
  constructor(
    @inject(TYPES.ITopicService) private topicService: ITopicService,
  ) {}

  async createTopic(req: Request, res: Response) {
    const { clientSharedId } = req.params;
    if (!clientSharedId) {
      res.sendStatus(400);
      return;
    }
    try {
      const topic = await this.topicService.createManagedTopic(
        clientSharedId,
        req.body,
      );
      res.status(201).json(topic);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateTopic(req: Request, res: Response) {
    const { clientSharedId, topicId } = req.params;
    if (!clientSharedId || !topicId) {
      res.sendStatus(400);
      return;
    }
    try {
      const topic = await this.topicService.updateManagedTopic(
        clientSharedId,
        topicId,
        req.body,
      );
      res.json(topic);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
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
