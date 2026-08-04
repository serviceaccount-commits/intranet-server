import { Request, Response } from 'express';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { ITopicService } from '../interfaces/topics/topic.service.interface';
import { CreateTopicInput } from '../schema/topics/CreateTopicSchema';
import { UpdateTopicInput } from '../schema/topics/UpdateTopicSchema';

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
}
