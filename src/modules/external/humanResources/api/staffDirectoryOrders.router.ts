import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { StaffDirectoryOrderController } from '../controllers/staffDirectoryOrders.controller';

const sdOrderController = container.get<StaffDirectoryOrderController>(
  StaffDirectoryOrderController,
);

const sdOrderRouter = Router();

sdOrderRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await sdOrderController.createStaffDirectoryOrder(req, res);
    } catch (error) {
      next(error);
    }
  },
);

sdOrderRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await sdOrderController.getStaffDirectoryOrder(req, res);
    } catch (error) {
      next(error);
    }
  },
);

sdOrderRouter.delete(
  '/:staffDirectoryOrderId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await sdOrderController.deleteStaffDirectoryOrderById(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { sdOrderRouter };
