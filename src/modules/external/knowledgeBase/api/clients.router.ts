import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { ClientController } from '../controllers/clients.controller';

const clientController = container.get<ClientController>(ClientController);

const clientsRouter = Router();

clientsRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await clientController.createClient(req, res);
    } catch (error) {
      next(error);
    }
  },
);

clientsRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await clientController.getClientsByAccess(req, res);
    } catch (error) {
      next(error);
    }
  },
);

clientsRouter.get(
  '/all',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await clientController.getClients(req, res);
    } catch (error) {
      next(error);
    }
  },
);

clientsRouter.get(
  '/all/filters',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await clientController.getClientsFilters(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

clientsRouter.get(
  '/:clientId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await clientController.getClientById(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { clientsRouter };
