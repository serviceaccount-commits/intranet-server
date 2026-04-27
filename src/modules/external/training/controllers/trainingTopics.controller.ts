import { NextFunction, Request, Response } from 'express';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { ZodError } from 'zod';
import { AppError } from '../../../../shared/errors/AppError';
import { ITrainingTopicService } from '../interfaces/trainingTopics/trainingTopic.service.interface';
import { CreateTrainingTopicInput } from '../schema/trainingTopics/CreateTrainingTopicSchema';
import { UpdateTrainingTopicInput } from '../schema/trainingTopics/UpdateTraingTopicSchema';

@injectable()
export class TrainingTopicController {
  constructor(
    @inject(TYPES.ITrainingTopicService)
    private trainingTopicService: ITrainingTopicService,
  ) {}

  async createTopic(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateTrainingTopicInput = req.body;
      const course = await this.trainingTopicService.createTopic(input);

      res.status(201).json(course);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error });
      }
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async updateTopic(req: Request, res: Response, next: NextFunction) {
    try {
      const { topicId } = req.params;
      const input: UpdateTrainingTopicInput = req.body;

      if (!topicId) {
        res.sendStatus(400);
        return;
      }

      await this.trainingTopicService.updateTopic(topicId, input);

      res.status(204).send();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error });
      }
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async getTopics(req: Request, res: Response) {
    const { courseId } = req.params;

    if (!courseId) {
      res.sendStatus(400);
      return;
    }

    const courses = await this.trainingTopicService.getTopics(courseId);

    res.json(courses);
  }

  async getTopicById(req: Request, res: Response) {
    const { topicId } = req.params;

    if (!topicId) {
      res.sendStatus(400);
      return;
    }

    const topic = await this.trainingTopicService.getTopicById(topicId);

    res.json(topic);
  }

  async getPublishedClassesForUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { topicId, userId } = req.params;
      if (!topicId || !userId) {
        res.sendStatus(400);
        return;
      }


      const classesWithStatus =
        await this.trainingTopicService.getPublishedClassesWithUserCompletionStatus(
          topicId,
          userId,
        );

      res.status(200).json(classesWithStatus);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error });
      }
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}
