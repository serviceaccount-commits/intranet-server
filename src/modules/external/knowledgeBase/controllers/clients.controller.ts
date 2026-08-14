import { NextFunction, Request, Response } from 'express';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IClientService } from '../interfaces/clients/client.service.interface';
import { CreateClientInput } from '../schema/clients/CreateClientSchema';
import { FilterClientSchema } from '../schema/clients/FilterClientSchema';
import { ZodError } from 'zod';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { ConflictError } from '../../../../shared/errors/ConflictError';

@injectable()
export class ClientController {
  constructor(
    @inject(TYPES.IClientService) private clientService: IClientService,
  ) {}

  async createClient(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.sendStatus(400);
      return;
    }
    const input: CreateClientInput = req.body;

    await this.clientService.createClient(input, userId);

    res.sendStatus(201);
  }

  async updateClient(req: Request, res: Response) {
    const userId = req.user?.id;
    const { clientId } = req.params;
    if (!userId || !clientId) {
      res.sendStatus(400);
      return;
    }

    try {
      const updated = await this.clientService.updateClient({
        ...req.body,
        clientId,
      });
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: 'Validation failed', issues: error.issues });
        return;
      }
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error instanceof ConflictError) {
        res.status(409).json({ message: error.message });
        return;
      }
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Unexpected error',
      });
    }
  }

  async getClients(_req: Request, res: Response) {
    const clients = await this.clientService.getClients();

    res.json(clients);
  }

  async getClientsFilters(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = FilterClientSchema.parse(req.query);
      const userId = req.user?.id;

      if (!userId) {
        res.sendStatus(400);
        return;
      }

      const result =
        await this.clientService.getFilteredClients(validationResult);
      return res.json({
        data: result,
        pagination: {
          totalItems: result.total,
          currentPage: validationResult.page,
          itemsPerPage: validationResult.limit,
          totalPages: Math.ceil(result.total / validationResult.limit),
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error);
      }
      next(error);
    }
  }

  async getClientsByAccess(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.sendStatus(400);
      return;
    }

    const clients = await this.clientService.getClientsByAccess(userId);
    res.json(clients);
  }

  async getClientById(req: Request, res: Response) {
    const { clientId } = req.params;

    if (!clientId) {
      res.sendStatus(400);
      return;
    }

    const client = await this.clientService.getClientById(clientId);

    res.json(client);
  }

  async getExternalClients(_req: Request, res: Response) {
    const clients = await this.clientService.getClients();
    const minimal = clients
      .filter((c) => c.client_shared_id)
      .map((c) => ({
        client_shared_id: c.client_shared_id,
        client_name: c.client_name,
      }))
      .sort((a, b) => a.client_shared_id.localeCompare(b.client_shared_id));
    res.json(minimal);
  }
}
