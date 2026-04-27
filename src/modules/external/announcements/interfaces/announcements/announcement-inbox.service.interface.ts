import { Announcement } from '../../entity/Announcement.entity';
import { FilterInboxAnnouncementInput } from '../../schema/FilterInboxAnnouncementSchema';
import { FilterSentAnnouncementInput } from '../../schema/FilterSentAnnouncementSchema';
import {
  AnnouncementWithContent,
  BannerAnnouncements,
  PaginatedAnnouncementWithContentResult,
  PaginatedInboxAnnouncementsResult,
} from '../../types/Announcements.types';

export interface IAnnouncementInboxService {
  getAnnouncements(): Promise<Announcement[]>;
  getInbox(userId: string, filters: FilterInboxAnnouncementInput): Promise<PaginatedInboxAnnouncementsResult>;
  getSent(userId: string, filters: FilterSentAnnouncementInput): Promise<PaginatedAnnouncementWithContentResult>;
  getAnnouncementById(announcementId: string): Promise<AnnouncementWithContent>;
  getAnnouncementCleanContent(announcementId: string): Promise<string>;
  findBannerAnnouncements(userId: string): Promise<BannerAnnouncements>;
}
