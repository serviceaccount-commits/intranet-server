import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import {
  ITimeTrackerService,
  TimeTrackerRequest,
  TimeTrackerResponse,
} from '../interfaces/timeTracker.service.interface';

/**
 * Thin proxy to the Paricus Time Tracker's service API. Statuses and bodies
 * (problem+json codes like DAY_CLOSED or SERVICE_USER_NOT_FOUND) pass through
 * untouched so the frontend reacts to the tracker's own contract.
 */
@injectable()
export class TimeTrackerController {
  constructor(
    @inject(TYPES.ITimeTrackerService)
    private timeTracker: ITimeTrackerService,
  ) {}

  private async act(req: Request, res: Response, request: TimeTrackerRequest) {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    this.send(res, await this.timeTracker.forward(userId, request));
  }

  private send(res: Response, upstream: TimeTrackerResponse) {
    if (upstream.status === 204) {
      res.sendStatus(204);
      return;
    }
    res.status(upstream.status).json(upstream.body);
  }

  private idempotencyKey(req: Request): string | undefined {
    return req.header('Idempotency-Key') || undefined;
  }

  private entryId(req: Request): number | null {
    const id = Number(req.params['entryId']);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  async getTimesheet(req: Request, res: Response) {
    const week = String(req.query['week'] ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) {
      res.status(400).json({ message: 'week must be a YYYY-MM-DD date' });
      return;
    }
    await this.act(req, res, {
      method: 'GET',
      path: '/me/timesheet',
      query: { week },
    });
  }

  async createEntry(req: Request, res: Response) {
    await this.act(req, res, {
      method: 'POST',
      path: '/time-entries',
      body: req.body,
      idempotencyKey: this.idempotencyKey(req),
    });
  }

  async updateEntry(req: Request, res: Response) {
    const entryId = this.entryId(req);
    if (entryId === null) {
      res.status(400).json({ message: 'entryId must be a positive integer' });
      return;
    }
    await this.act(req, res, {
      method: 'PATCH',
      path: `/time-entries/${entryId}`,
      body: req.body,
    });
  }

  async deleteEntry(req: Request, res: Response) {
    const entryId = this.entryId(req);
    const version = Number(req.query['version']);
    if (entryId === null || !Number.isInteger(version) || version < 1) {
      res.status(400).json({
        message: 'entryId and version must be positive integers',
      });
      return;
    }
    await this.act(req, res, {
      method: 'DELETE',
      path: `/time-entries/${entryId}`,
      query: { version: String(version) },
    });
  }

  async startTimer(req: Request, res: Response) {
    await this.act(req, res, {
      method: 'POST',
      path: '/me/timer/start',
      body: req.body,
      idempotencyKey: this.idempotencyKey(req),
    });
  }

  async stopTimer(req: Request, res: Response) {
    await this.act(req, res, {
      method: 'POST',
      path: '/me/timer/stop',
      idempotencyKey: this.idempotencyKey(req),
    });
  }
}
