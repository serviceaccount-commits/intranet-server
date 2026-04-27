import { inject, injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IUserRepository } from '../../../internal/users/interfaces/users/user.repository.interface';
import { IAnnouncementRepository } from '../interfaces/announcements/announcement.repository.interface';
import { IAnnouncementAcknowledgementRepository } from '../interfaces/announcements/announcementAcknowledgement.repository.interface';
import { IAnnouncementReadRepository } from '../interfaces/announcements/announcementRead.repository.interface';
import { IAnnouncementEngagementService } from '../interfaces/announcements/announcement-engagement.service.interface';
import { AnnouncementAcknowledgement } from '../entity/AnnouncementAcknowledgement.entity';
import { AnnouncementRead } from '../entity/AnnouncementRead.entity';
import { FilterAnnouncementReportInput } from '../schema/FilterAnnouncementReportSchema';
import {
  AcknowledgedUser,
  PaginatedAnnouncementReportUsers,
  ReadUser,
  NameReportsToUser,
} from '../types/Announcements.types';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

@injectable()
export class AnnouncementEngagementService implements IAnnouncementEngagementService {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IAnnouncementRepository)
    private announcementRepository: IAnnouncementRepository,
    @inject(TYPES.IAnnouncementAcknowledgementRepository)
    private announcementAcknowledgementRepository: IAnnouncementAcknowledgementRepository,
    @inject(TYPES.IAnnouncementReadRepository)
    private announcementReadRepository: IAnnouncementReadRepository,
  ) {}

  async addAcknowledgeToAnnouncement(announcementId: string, userId: string): Promise<void> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const existingAcknowledge =
        await this.announcementAcknowledgementRepository.findByAnnouncementAndUserId(
          announcementId,
          userId,
        );
      if (existingAcknowledge) return;

      const user = await this.userRepository.findUserById(userId);
      if (!user) throw new NotFoundError('User', userId);

      const announcement = await this.announcementRepository.findById(announcementId);
      if (!announcement) throw new NotFoundError('Announcement', announcementId);

      const newAnnAck = new AnnouncementAcknowledgement();
      await this.announcementAcknowledgementRepository.create(newAnnAck, announcement, user);
    });
  }

  async addReadToAnnouncement(announcementId: string, userId: string): Promise<void> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const existingRead =
        await this.announcementReadRepository.findByAnnouncementAndUserId(announcementId, userId);
      if (existingRead) return;

      const user = await this.userRepository.findUserById(userId);
      if (!user) throw new NotFoundError('User', userId);

      const announcement = await this.announcementRepository.findById(announcementId);
      if (!announcement) throw new NotFoundError('Announcement', announcementId);

      const newRead = new AnnouncementRead();
      newRead.announcement = announcement;
      newRead.announcement_id = announcement.announcement_id;
      newRead.user = user;
      newRead.user_id = user.user_id;

      await this.announcementReadRepository.create(newRead);
    });
  }

  async getAnnouncementReport(
    announcementId: string,
    filters: FilterAnnouncementReportInput,
    usePagination: boolean = true,
  ): Promise<PaginatedAnnouncementReportUsers> {
    const assignedUsers = await this.announcementRepository.findAllAssignedUsers(
      announcementId,
      filters,
      usePagination,
    );

    let status: string[] = [];
    if (filters.status !== undefined) {
      status = (filters.status[0]?.split(',') as string[]) ?? [];
    }

    const acknowledgedUsers: AcknowledgedUser[] = [];
    const readUsers: ReadUser[] = [];
    const nothingUsers: NameReportsToUser[] = [];

    for (const user of assignedUsers.users) {
      if (
        user.acknowledgements?.findIndex((a) => a.announcement_id === announcementId) !== -1 &&
        status.findIndex((s) => s === 'acknowledged') !== -1
      ) {
        const acknowledgement = user.acknowledgements?.find(
          (a) => a.announcement_id === announcementId,
        );
        if (!acknowledgement) continue;
        acknowledgedUsers.push({
          user: { user_id: user.user_id, first_name: user.first_name, last_name: user.last_name },
          acknowledged_at: acknowledgement.created_at,
        });
        continue;
      } else if (
        user.read?.findIndex((a) => a.announcement_id === announcementId) !== -1 &&
        status.findIndex((s) => s === 'read') !== -1
      ) {
        const read = user.read?.find((a) => a.announcement_id === announcementId);
        if (!read) continue;
        const acknowledgement = user.acknowledgements?.find(
          (a) => a.announcement_id === announcementId,
        );
        if (acknowledgement) continue;
        readUsers.push({
          user: { user_id: user.user_id, first_name: user.first_name, last_name: user.last_name },
          read_at: read.created_at,
        });
        continue;
      } else if (status.findIndex((s) => s === 'not-read-yet') !== -1) {
        const read = user.read?.find((a) => a.announcement_id === announcementId);
        if (read) continue;
        const acknowledgement = user.acknowledgements?.find(
          (a) => a.announcement_id === announcementId,
        );
        if (acknowledgement) continue;
        nothingUsers.push({
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
        });
      }
    }

    return {
      announcementReportUsers: {
        acknowledgedUsers,
        readUsers,
        notReadYetUsers: nothingUsers,
      },
      total: assignedUsers.total,
    };
  }
}
