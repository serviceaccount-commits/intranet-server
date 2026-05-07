import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { ClientController } from '../controllers/clients.controller';

const clientController = container.get<ClientController>(ClientController);

const externalClientsRouter = Router();

externalClientsRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await clientController.getExternalClients(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { externalClientsRouter };
