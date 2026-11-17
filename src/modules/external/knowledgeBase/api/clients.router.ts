import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { ClientController } from '../controllers/clients.controller';
import { checkPermission } from '../../../internal/auth/middlewares/permission.middleware';

const clientController = container.get<ClientController>(ClientController);

const clientsRouter = Router();

// Creating, editing and deleting clients. The UI already hid these behind the
// permission; the server now enforces it too.
const canManageClients = checkPermission('kb:client:manage');

clientsRouter.post(
  '/',
  canManageClients,
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

clientsRouter.put(
  '/:clientId',
  canManageClients,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await clientController.updateClient(req, res);
    } catch (error) {
      next(error);
    }
  },
);

// Only a client with no folders at all (archived ones included) can go
clientsRouter.delete(
  '/:clientId',
  canManageClients,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await clientController.deleteClient(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { clientsRouter };
