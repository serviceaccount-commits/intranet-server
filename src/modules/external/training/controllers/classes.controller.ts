import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IClassService } from '../interfaces/classes/class.service.interface';
import { CreateClassInput } from '../schema/classes/CreateClassSchema';
import { ZodError } from 'zod';
import { AppError } from '../../../../shared/errors/AppError';
import { UpdateClassInput } from '../schema/classes/UpdateClassSchema';
import { CreateCommentInput } from '../schema/comments/CreateCommentSchema';
import { UpdateCommentInput } from '../schema/comments/UpdateCommentSchema';

@injectable()
export class ClassController {
  constructor(
    @inject(TYPES.IClassService) private classService: IClassService,
  ) {}

  async createClass(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateClassInput = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(400);
        return;
      }
      input.userId = userId;

      const trainingClass = await this.classService.createClass(input);

      res.status(201).json(trainingClass);
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

  async updateClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const input: UpdateClassInput = req.body;

      if (!classId) {
        res.sendStatus(400);
        return;
      }

      await this.classService.updateClass(classId, input);

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

  async updateClassUserValue(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const userId = req.user?.id;
      const { completionStatus } = req.body;
      if (!classId || !userId || !completionStatus) {
        res.sendStatus(400);
        return;
      }

      await this.classService.updateClassUserValue(
        classId,
        userId,
        completionStatus,
      );
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

  async getClasses(req: Request, res: Response) {
    const { topicId } = req.params;

    if (!topicId) {
      res.sendStatus(400);
      return;
    }

    const classes = await this.classService.getClasses(topicId);

    res.json(classes);
  }

  async getClassById(req: Request, res: Response) {
    const { classId } = req.params;
    if (!classId) {
      res.sendStatus(400);
      return;
    }

    const classEntity = await this.classService.getClassById(classId);

    res.json(classEntity);
  }

  async getClassByIdWithUserValue(req: Request, res: Response) {
    const { classId } = req.params;
    const userId = req.user?.id;
    if (!classId || !userId) {
      res.sendStatus(400);
      return;
    }

    const data = await this.classService.getClassByIdWithUserValueAndExam(
      classId,
      userId,
    );

    res.json(data);
  }

  async addCommentToClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const input: CreateCommentInput = req.body;

      if (!classId) {
        res.sendStatus(400);
        return;
      }

      const classEntity = await this.classService.addCommentToClass(
        classId,
        input,
      );

      res.status(201).json(classEntity);
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

  async getComments(req: Request, res: Response) {
    const { classId } = req.params;

    if (!classId) {
      res.sendStatus(400);
      return;
    }

    const comments = await this.classService.getComments(classId);

    res.json(comments);
  }

  async getActiveComments(req: Request, res: Response) {
    const { classId } = req.params;

    if (!classId) {
      res.sendStatus(400);
      return;
    }

    const comments = await this.classService.getClassActiveComments(classId);

    res.json(comments);
  }

  async getCommentById(req: Request, res: Response) {
    const { commentId } = req.params;

    if (!commentId) {
      res.sendStatus(400);
      return;
    }

    const comment = await this.classService.getCommentById(commentId);

    res.json(comment);
  }

  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const input: UpdateCommentInput = req.body;

      if (!commentId) {
        res.sendStatus(400);
        return;
      }

      await this.classService.updateComment(commentId, input);

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
}
