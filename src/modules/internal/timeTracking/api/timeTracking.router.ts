import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { TimeTrackerController } from '../controllers/timeTracker.controller';

const controller = container.get<TimeTrackerController>(TimeTrackerController);

const timeTrackingRouter = Router();

const handle =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };

timeTrackingRouter.get(
  '/me/timesheet',
  handle((req, res) => controller.getTimesheet(req, res)),
);
timeTrackingRouter.post(
  '/time-entries',
  handle((req, res) => controller.createEntry(req, res)),
);
timeTrackingRouter.patch(
  '/time-entries/:entryId',
  handle((req, res) => controller.updateEntry(req, res)),
);
timeTrackingRouter.delete(
  '/time-entries/:entryId',
  handle((req, res) => controller.deleteEntry(req, res)),
);
timeTrackingRouter.post(
  '/me/timer/start',
  handle((req, res) => controller.startTimer(req, res)),
);
timeTrackingRouter.post(
  '/me/timer/stop',
  handle((req, res) => controller.stopTimer(req, res)),
);

export { timeTrackingRouter };
