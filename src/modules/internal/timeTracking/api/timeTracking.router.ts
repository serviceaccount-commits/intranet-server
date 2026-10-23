import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
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
  '/me/submissions',
  handle((req, res) => controller.submit(req, res)),
);
timeTrackingRouter.post(
  '/unlock-requests',
  handle((req, res) => controller.requestUnlock(req, res)),
);
timeTrackingRouter.get(
  '/unlock-reasons',
  handle((req, res) => controller.unlockReasons(req, res)),
);
timeTrackingRouter.post(
  '/handoff',
  handle((req, res) => controller.handoff(req, res)),
);
// Same caps as the tracker (3 images of 3 MB at most), so an oversized upload is cut off here
// instead of being buffered and forwarded. Kept in memory: it only passes through.
const MAX_REPORT_IMAGES = 3;
const reportUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024,
    files: MAX_REPORT_IMAGES,
    fields: 4,
    fieldSize: 16 * 1024,
  },
}).array('images', MAX_REPORT_IMAGES);

const withReportUpload = (req: Request, res: Response, next: NextFunction) =>
  reportUpload(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      // The tracker's problem+json shape, so the module shows it like any other tracker error.
      res.status(422).json({
        type: 'about:blank',
        title: 'Attachment not accepted',
        status: 422,
        code: 'INVALID_ATTACHMENT',
        detail:
          error.code === 'LIMIT_FILE_SIZE'
            ? 'Each image must be under 3 MB.'
            : `Attach up to ${MAX_REPORT_IMAGES} images.`,
      });
      return;
    }
    if (error) {
      next(error);
      return;
    }
    next();
  });

timeTrackingRouter.post(
  '/error-reports',
  withReportUpload,
  handle((req, res) => controller.reportProblem(req, res)),
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
