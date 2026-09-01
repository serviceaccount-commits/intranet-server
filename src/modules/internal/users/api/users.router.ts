import { Router, Request, Response, NextFunction } from 'express';
import UserController from '../controllers/users.controller';
import { container } from '../../../../shared/config/inversify.config';
import { authenticateJWT } from '../../auth/middlewares/auth.middleware';
import {
  checkAnyPermission,
  checkPermission,
  checkSelfOrPermission,
} from '../../auth/middlewares/permission.middleware';

let userController: UserController;

const usersRouter = Router();

// Creating, editing and deleting people is the Staff Directory's
// administrative ability. Announcements reaches the same endpoint from its own
// screen, so both go through the one permission that governs it.
const canAdminUsers = checkPermission('directory:user:create');

// Reading the user list feeds the directory itself and the recipient pickers of
// Announcements — accept whichever module the caller actually holds.
const canListUsers = checkAnyPermission(
  'directory:list',
  'directory:access',
  'announcements:access',
);

// Someone always gets to read and edit their own record; everyone else needs
// the directory permission.
const canReadProfile = checkSelfOrPermission(
  'userId',
  'directory:profile:access',
);
const canEditUser = checkSelfOrPermission('userId', 'directory:user:create');

usersRouter.post(
  '/',
  canAdminUsers,
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

// Self-service: every signed-in user reports their own activity and closes
// their own onboarding, so these stay open to anyone authenticated.
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

usersRouter.post(
  '/onboarding-completed',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!userController) {
        userController = container.get<UserController>(UserController);
      }
      await userController.completeOnboarding(req, res);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.get(
  '/',
  authenticateJWT,
  canListUsers,
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

// The home page ranking: shown to everyone who can log in.
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
  canReadProfile,
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

// Three segments, so it never collides with '/profile/:userId' above.
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
  canEditUser,
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
  canAdminUsers,
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
