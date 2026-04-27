import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { AnnouncementController } from '../controllers/announcements.controller';

const announcementController = container.get<AnnouncementController>(
  AnnouncementController,
);

const announcementsRouter = Router();

announcementsRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.createAnnouncement(req, res);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.put(
  '/:announcementId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.updateAnnouncementRecipients(req, res);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.delete(
  '/persistent/:announcementId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.deletePersistentAnnouncement(req, res);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.post(
  '/acknowledge/:announcementId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.addAcknowledgeToAnnouncement(req, res);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.post(
  '/read/:announcementId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.addReadToAnnouncement(req, res);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.getAnnouncements(req, res);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.get(
  '/inbox',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.getInbox(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.get(
  '/sent',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.getSent(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.get(
  '/:announcementId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.getAnnouncementById(req, res);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.get(
  '/:announcementId/clean-content',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.getAnnouncementCleanContent(req, res);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.get(
  '/:announcementId/recipients',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.getAnnouncementRecipients(req, res);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.get(
  '/:announcementId/report',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.getAnnouncementReport(req, res);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.get(
  '/:announcementId/export-report',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.exportAnnouncementReportWithFilter(
        req,
        res,
        next,
      );
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.get(
  '/senders/users',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.findAnnouncementSenders(req, res);
    } catch (error) {
      next(error);
    }
  },
);

announcementsRouter.get(
  '/non-acknowledged/banner',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementController.findBannerAnnouncements(req, res);
    } catch (error) {
      next(error);
    }
  },
);
export { announcementsRouter };
