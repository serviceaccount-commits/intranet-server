import { User } from '../../../../internal/users/entities/User.entity';
import { Announcement } from '../../entity/Announcement.entity';
import { CreateAnnouncementInput } from '../../schema/CreateAnnouncementSchema';
import { FilterAnnouncementReportInput } from '../../schema/FilterAnnouncementReportSchema';
import { FilterInboxAnnouncementInput } from '../../schema/FilterInboxAnnouncementSchema';
import { FilterSentAnnouncementInput } from '../../schema/FilterSentAnnouncementSchema';
import {
  AnnouncementWithContent,
  BannerAnnouncements,
  PaginatedAnnouncementReportUsers,
  PaginatedAnnouncementWithContentResult,
  PaginatedInboxAnnouncementsResult,
} from '../../types/Announcements.types';

export interface IAnnouncementService {
  createAnnouncement(
    input: CreateAnnouncementInput,
    userId: string,
  ): Promise<Announcement>;

  deletePersistentAnnouncement(announcementId: string): Promise<void>;

  updateAnnouncementRecipients(
    announcementId: string,
    userIds: string[],
  ): Promise<void>;

  addAcknowledgeToAnnouncement(
    announcementId: string,
    userId: string,
  ): Promise<void>;

  addReadToAnnouncement(announcementId: string, userId: string): Promise<void>;

  getAnnouncementReport(
    announcementId: string,
    filters: FilterAnnouncementReportInput,
    usePagination: boolean,
  ): Promise<PaginatedAnnouncementReportUsers>;

  getAnnouncements(): Promise<Announcement[]>;

  getInbox(
    userId: string,
    filters: FilterInboxAnnouncementInput,
  ): Promise<PaginatedInboxAnnouncementsResult>;

  getSent(
    userId: string,
    filters: FilterSentAnnouncementInput,
  ): Promise<PaginatedAnnouncementWithContentResult>;

  findBannerAnnouncements(userId: string): Promise<BannerAnnouncements>;

  getAnnouncementById(announcementId: string): Promise<AnnouncementWithContent>;

  findAnnouncementSenders(userId: string): Promise<User[]>;

  findAnnouncementRecipients(announcementId: string): Promise<User[]>;

  getAnnouncementCleanContent(announcementId: string): Promise<string>;
}
