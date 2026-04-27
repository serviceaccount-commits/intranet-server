import { NextFunction, Request, Response } from 'express';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { ICourseService } from '../interfaces/courses/course.service.interface';
import { CreateCourseInput } from '../schema/courses/CreateCourseSchema';
import { ZodError } from 'zod';
import { AppError } from '../../../../shared/errors/AppError';
import { UpdateCourseInput } from '../schema/courses/UpdateCourseSchema';

@injectable()
export class CourseController {
  constructor(
    @inject(TYPES.ICourseService) private courseService: ICourseService,
  ) {}

  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateCourseInput = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(400);
        return;
      }
      input.userId = userId;

      const course = await this.courseService.createCourse(input);

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

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const input: UpdateCourseInput = req.body;

      if (!courseId) {
        res.sendStatus(400);
        return;
      }

      await this.courseService.updateCourse(courseId, input);

      res.status(204).send();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error);
      }
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async updateCourseTitle(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const input: UpdateCourseInput = req.body;

      if (!courseId) {
        res.sendStatus(400);
        return;
      }

      await this.courseService.updateCourseTitle(courseId, input.courseName);

      res.status(204).send();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error);
      }
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async updateCourseDescription(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { courseId } = req.params;
      const input: UpdateCourseInput = req.body;

      if (!courseId) {
        res.sendStatus(400);
        return;
      }

      await this.courseService.updateCourseDescription(
        courseId,
        input.courseDescription,
      );

      res.status(204).send();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error);
      }
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async getPublicCourses(_req: Request, res: Response) {
    const courses = await this.courseService.getCourses(false);

    res.json(courses);
  }

  async getAdminCourses(_req: Request, res: Response) {
    const courses = await this.courseService.getCourses(true);

    res.json(courses);
  }

  async getCreatedCourses(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    if (!userId) {
      res.sendStatus(400);
      return;
    }

    try {
      const courses = await this.courseService.getCreatedCourses(userId);

      res.status(200).json(courses);
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

  async getCourseById(req: Request, res: Response) {
    const { courseId } = req.params;

    if (!courseId) {
      res.sendStatus(400);
      return;
    }
    const course = await this.courseService.getCourseById(courseId);

    res.json(course);
  }

  async getCourseValues(req: Request, res: Response) {
    const { courseId } = req.params;

    if (!courseId) {
      res.sendStatus(400);
      return;
    }

    const courseValues = await this.courseService.getCourseValues(courseId);

    res.json(courseValues);
  }

  async getUserCoursesWithProgress(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // TODO: Get userId securely from authenticated request
      const userId = req.user?.id;

      if (!userId) {
        res.sendStatus(400);
        return;
      }

      const coursesWithProgress =
        await this.courseService.getCoursesWithProgress(userId);

      res.status(200).json(coursesWithProgress);
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

  async getCourseTopicsWithProgress(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id;

      if (!userId || !courseId) {
        res.sendStatus(400);
        return;
      }

      const topicsWithProgress =
        await this.courseService.getCourseTopicsWithProgress(userId, courseId);

      res.status(200).json(topicsWithProgress);
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
