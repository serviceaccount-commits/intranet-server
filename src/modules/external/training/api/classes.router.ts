import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { ClassController } from '../controllers/classes.controller';

const classController = container.get<ClassController>(ClassController);

const classRouter = Router();

classRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await classController.createClass(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

classRouter.get(
  '/topic/:topicId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await classController.getClasses(req, res);
    } catch (error) {
      next(error);
    }
  },
);

classRouter.get(
  '/:classId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await classController.getClassById(req, res);
    } catch (error) {
      next(error);
    }
  },
);

classRouter.get(
  '/:classId/user',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await classController.getClassByIdWithUserValue(req, res);
    } catch (error) {
      next(error);
    }
  },
);

classRouter.put(
  '/:classId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await classController.updateClass(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

classRouter.put(
  '/:classId/user',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await classController.updateClassUserValue(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

// COMMENTS
classRouter.post(
  '/comments/:classId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await classController.addCommentToClass(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

classRouter.get(
  '/:classId/comments',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await classController.getComments(req, res);
    } catch (error) {
      next(error);
    }
  },
);

classRouter.get(
  '/:classId/comments/active',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await classController.getActiveComments(req, res);
    } catch (error) {
      next(error);
    }
  },
);

classRouter.get(
  '/comments/:commentId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await classController.getCommentById(req, res);
    } catch (error) {
      next(error);
    }
  },
);
classRouter.put(
  '/comments/:commentId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await classController.updateComment(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

// CLASS VALUE

export { classRouter };
