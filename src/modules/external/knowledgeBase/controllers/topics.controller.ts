import { Request, Response } from 'express';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { ITopicService } from '../interfaces/topics/topic.service.interface';
import { CreateTopicInput } from '../schema/topics/CreateTopicSchema';
import { UpdateTopicInput } from '../schema/topics/UpdateTopicSchema';
import { AppError } from '../../../../shared/errors/AppError';

const sendError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  throw error;
};

@injectable()
export class TopicController {
  constructor(
    @inject(TYPES.ITopicService) private topicService: ITopicService,
  ) {}

  async createTopic(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.sendStatus(400);
      return;
    }
    const input: CreateTopicInput = req.body;
    input.userId = userId;

    const topic = await this.topicService.createTopic(input);

    return res.json(topic);
  }

  async updateTopic(req: Request, res: Response) {
    const { topicId } = req.params;
    if (!topicId) {
      res.sendStatus(400);
      return;
    }

    const input: UpdateTopicInput = {
      ...(req.body as Omit<UpdateTopicInput, 'topicId'>),
      topicId,
    };

    const topic = await this.topicService.updateTopic(input);
    return res.json(topic);
  }

  async getTopics(req: Request, res: Response) {
    const { clientId } = req.params;
    const userId = req.user?.id;
    if (!clientId || !userId) {
      res.sendStatus(400);
      return;
    }
    const topics = await this.topicService.getTopics(clientId, userId);

    return res.json(topics);
  }

  async getTopicById(req: Request, res: Response) {
    const { topicId } = req.params;
    const userId = req.user?.id;

    if (!topicId || !userId) {
      res.sendStatus(400);
      return;
    }

    const topic = await this.topicService.getTopicById(topicId, userId);

    return res.json(topic);
  }

  async getTopicContents(req: Request, res: Response) {
    const { topicId } = req.params;
    const userId = req.user?.id;
    if (!topicId || !userId) {
      res.sendStatus(400);
      return;
    }
    try {
      res.json(await this.topicService.getTopicContents(topicId, userId));
    } catch (error) {
      sendError(res, error);
    }
  }

  async deleteTopic(req: Request, res: Response) {
    const { topicId } = req.params;
    const userId = req.user?.id;
    if (!topicId || !userId) {
      res.sendStatus(400);
      return;
    }
    try {
      res.json(await this.topicService.deleteTopic(topicId, userId));
    } catch (error) {
      sendError(res, error);
    }
  }

  async getTopicAccess(req: Request, res: Response) {
    const { topicId } = req.params;
    const userId = req.user?.id;
    if (!topicId || !userId) {
      res.sendStatus(400);
      return;
    }
    try {
      res.json(await this.topicService.getTopicAccess(topicId, userId));
    } catch (error) {
      sendError(res, error);
    }
  }

  async setTopicAccess(req: Request, res: Response) {
    const { topicId } = req.params;
    const userId = req.user?.id;
    const { userIds } = req.body ?? {};
    if (
      !topicId ||
      !userId ||
      !Array.isArray(userIds) ||
      userIds.some((id: unknown) => typeof id !== 'string')
    ) {
      res.sendStatus(400);
      return;
    }
    try {
      await this.topicService.setTopicAccess(topicId, userIds, userId);
      res.sendStatus(204);
    } catch (error) {
      sendError(res, error);
    }
  }
}
