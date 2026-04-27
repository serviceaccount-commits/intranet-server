import { Router, Request, Response, NextFunction } from 'express';
import UserController from '../controllers/users.controller';
import { container } from '../../../../shared/config/inversify.config';
import { authenticateJWT } from '../../auth/middlewares/auth.middleware';

let userController: UserController;

const usersRouter = Router();

usersRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!userController) {
        userController = container.get<UserController>(UserController);
      }
      await userController.createUser(req, res);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.post(
  '/last-activity',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!userController) {
        userController = container.get<UserController>(UserController);
      }
      await userController.updateLastActivity(req, res);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.get(
  '/',
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!userController) {
        userController = container.get<UserController>(UserController);
      }
      await userController.getUsers(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.get(
  '/sheet-data/:sheetOption',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!userController) {
        userController = container.get<UserController>(UserController);
      }
      await userController.getSheetData(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.get(
  '/profile/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!userController) {
        userController = container.get<UserController>(UserController);
      }
      await userController.getUserProfileById(req, res);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.get(
  '/profile/me/profile',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!userController) {
        userController = container.get<UserController>(UserController);
      }
      await userController.getMyUserProfile(req, res);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.put(
  '/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!userController) {
        userController = container.get<UserController>(UserController);
      }
      await userController.updateUser(req, res);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.delete(
  '/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!userController) {
        userController = container.get<UserController>(UserController);
      }
      await userController.deleteUser(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { usersRouter };
