import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ZodError } from 'zod';

import { TYPES } from '../../../../shared/config/containerTypes';
import { IAnnouncementInboxService } from '../interfaces/announcements/announcement-inbox.service.interface';
import { IAnnouncementManagementService } from '../interfaces/announcements/announcement-management.service.interface';
import { IAnnouncementEngagementService } from '../interfaces/announcements/announcement-engagement.service.interface';
import { CreateAnnouncementInput } from '../schema/CreateAnnouncementSchema';
import { FilterInboxAnnouncementSchema } from '../schema/FilterInboxAnnouncementSchema';
import { FilterSentAnnouncementSchema } from '../schema/FilterSentAnnouncementSchema';
import { FilterAnnouncementReportSchema } from '../schema/FilterAnnouncementReportSchema';
import { AnnouncementUserReportExport } from '../types/Announcements.types';
import { convertToCsv } from '../../../../shared/utils/convertToCsv';
import { getFilenameTimestamp, getFormattedDate } from '../../../../shared/utils/getFormattedDate';

@injectable()
export class AnnouncementController {
  constructor(
    @inject(TYPES.IAnnouncementInboxService)
    private inboxService: IAnnouncementInboxService,
    @inject(TYPES.IAnnouncementManagementService)
    private managementService: IAnnouncementManagementService,
    @inject(TYPES.IAnnouncementEngagementService)
    private engagementService: IAnnouncementEngagementService,
  ) {}

  // ─── Management ───────────────────────────────────────────────────────────────

  async createAnnouncement(req: Request, res: Response) {
    const input: CreateAnnouncementInput = req.body;
    const userId = req.user?.id;
    if (!userId) { res.sendStatus(400); return; }

    const announcement = await this.managementService.createAnnouncement(input, userId);
    return res.json(announcement);
  }

  async deletePersistentAnnouncement(req: Request, res: Response) {
    const { announcementId } = req.params;
    if (!announcementId) { res.sendStatus(400); return; }

    try {
      await this.managementService.deletePersistentAnnouncement(announcementId);
      return res.sendStatus(200);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete announcement' });
    }
  }

  async updateAnnouncementRecipients(req: Request, res: Response) {
    const { userIds } = req.body;
    const { announcementId } = req.params;
    const userId = req.user?.id;
    if (!userId || !userIds || !announcementId) { res.sendStatus(400); return; }

    await this.managementService.updateAnnouncementRecipients(announcementId, userIds);
    return res.sendStatus(200);
  }

  async findAnnouncementSenders(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) { res.sendStatus(400); return; }

    const users = await this.managementService.findAnnouncementSenders(userId);
    return res.json(users);
  }

  async getAnnouncementRecipients(req: Request, res: Response) {
    const { announcementId } = req.params;
    if (!announcementId) { res.sendStatus(400); return; }

    const users = await this.managementService.findAnnouncementRecipients(announcementId);
    return res.json(users);
  }

  // ─── Inbox ────────────────────────────────────────────────────────────────────

  async getAnnouncements(_req: Request, res: Response) {
    const announcements = await this.inboxService.getAnnouncements();
    return res.json(announcements);
  }

  async getInbox(req: Request, res: Response, next: NextFunction) {
    const validationResult = FilterInboxAnnouncementSchema.parse(req.query);
    try {
      const userId = req.user?.id;
      if (!userId) { res.sendStatus(400); return; }

      const result = await this.inboxService.getInbox(userId, validationResult);
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
      if (error instanceof ZodError) return res.status(400).json(error);
      next(error);
    }
  }

  async getSent(req: Request, res: Response, next: NextFunction) {
    const validationResult = FilterSentAnnouncementSchema.parse(req.query);
    try {
      const userId = req.user?.id;
      if (!userId) { res.sendStatus(400); return; }

      const result = await this.inboxService.getSent(userId, validationResult);
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
      if (error instanceof ZodError) return res.status(400).json(error);
      next(error);
    }
  }

  async getAnnouncementById(req: Request, res: Response) {
    const { announcementId } = req.params;
    if (!announcementId) { res.sendStatus(400); return; }

    const announcement = await this.inboxService.getAnnouncementById(announcementId);
    return res.json(announcement);
  }

  async getAnnouncementCleanContent(req: Request, res: Response) {
    const { announcementId } = req.params;
    const userId = req.user?.id;
    if (!userId || !announcementId) { res.sendStatus(400); return; }

    const cleanContent = await this.inboxService.getAnnouncementCleanContent(announcementId);
    return res.json(cleanContent);
  }

  async findBannerAnnouncements(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) { res.sendStatus(400); return; }

    const announcements = await this.inboxService.findBannerAnnouncements(userId);
    return res.json(announcements);
  }

  // ─── Engagement ───────────────────────────────────────────────────────────────

  async addAcknowledgeToAnnouncement(req: Request, res: Response) {
    const { announcementId } = req.params;
    const userId = req.user?.id;
    if (!announcementId || !userId) { res.sendStatus(400); return; }

    await this.engagementService.addAcknowledgeToAnnouncement(announcementId, userId);
    return res.sendStatus(200);
  }

  async addReadToAnnouncement(req: Request, res: Response) {
    const { announcementId } = req.params;
    const userId = req.user?.id;
    if (!announcementId || !userId) { res.sendStatus(400); return; }

    await this.engagementService.addReadToAnnouncement(announcementId, userId);
    return res.sendStatus(200);
  }

  async getAnnouncementReport(req: Request, res: Response) {
    const validationResult = FilterAnnouncementReportSchema.parse(req.query);
    const { announcementId } = req.params;
    const userId = req.user?.id;
    if (!userId || !announcementId) { res.sendStatus(400); return; }

    const users = await this.engagementService.getAnnouncementReport(
      announcementId,
      validationResult,
      true,
    );

    return res.json({
      data: users.announcementReportUsers,
      pagination: {
        totalItems: users.total,
        currentPage: validationResult.page,
        itemsPerPage: validationResult.limit,
        totalPages: Math.ceil(users.total / validationResult.limit),
      },
    });
  }

  async exportAnnouncementReportWithFilter(req: Request, res: Response, next: NextFunction) {
    const validationResult = FilterAnnouncementReportSchema.parse(req.query);
    const { announcementId } = req.params;
    const userId = req.user?.id;

    try {
      if (!userId || !announcementId) { res.sendStatus(400); return; }

      const users = await this.engagementService.getAnnouncementReport(
        announcementId,
        validationResult,
        false,
      );

      const headerMapping: Partial<Record<keyof AnnouncementUserReportExport, string>> = {
        user_id: 'User ID',
        full_name: 'Full Name',
        status: 'Status',
        last_update: 'Last Update',
      };

      const data: AnnouncementUserReportExport[] = [];

      for (const user of users.announcementReportUsers.acknowledgedUsers) {
        data.push({
          user_id: user.user.user_id,
          full_name: `${user.user.first_name} ${user.user.last_name}`,
          status: 'Acknowledged',
          last_update: getFormattedDate(user.acknowledged_at.toString(), true, false),
        });
      }

      for (const user of users.announcementReportUsers.readUsers) {
        data.push({
          user_id: user.user.user_id,
          full_name: `${user.user.first_name} ${user.user.last_name}`,
          status: 'Read',
          last_update: getFormattedDate(user.read_at.toString(), true, false),
        });
      }

      for (const user of users.announcementReportUsers.notReadYetUsers) {
        data.push({
          user_id: user.user_id,
          full_name: `${user.first_name} ${user.last_name}`,
          status: 'Not Read Yet',
          last_update: '--',
        });
      }

      const csvString = convertToCsv(data, headerMapping);
      const fileName = `announcement-report-${getFilenameTimestamp()}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.status(200).send(csvString);
    } catch (error) {
      if (error instanceof ZodError) return res.status(400).json(error);
      next(error);
    }
  }
}
