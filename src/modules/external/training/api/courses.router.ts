import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { CourseController } from '../controllers/courses.controller';

const courseController = container.get<CourseController>(CourseController);

const courseRouter = Router();

courseRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await courseController.createCourse(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

//getting all courses no matter the status
courseRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await courseController.getPublicCourses(req, res);
    } catch (error) {
      next(error);
    }
  },
);

courseRouter.get(
  '/:courseId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await courseController.getCourseById(req, res);
    } catch (error) {
      next(error);
    }
  },
);

courseRouter.get(
  '/user/progress',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await courseController.getUserCoursesWithProgress(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

courseRouter.get(
  '/admin/created',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await courseController.getAdminCourses(req, res);
    } catch (error) {
      next(error);
    }
  },
);

//getting active/published topics for a specific user
courseRouter.get(
  '/course/:courseId/progress',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await courseController.getCourseTopicsWithProgress(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

courseRouter.put(
  '/:courseId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await courseController.updateCourse(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

courseRouter.put(
  '/title/:courseId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await courseController.updateCourseTitle(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

courseRouter.put(
  '/description/:courseId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await courseController.updateCourseDescription(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export { courseRouter };
