import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { UserReportsToController } from '../controllers/userReportsTo.controller';

const userReportsToController = container.get<UserReportsToController>(
  UserReportsToController,
);

const userReportsToRouter = Router();

userReportsToRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await userReportsToController.createReportsTo(req, res);
    } catch (error) {
      next(error);
    }
  },
);

userReportsToRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await userReportsToController.getReportsTo(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { userReportsToRouter };
