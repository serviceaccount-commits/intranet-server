import { Document } from '../../../../internal/documents/entities/Document.entity';
import { User } from '../../../../internal/users/entities/User.entity';
import { Announcement } from '../../entity/Announcement.entity';
import { FilterAnnouncementReportInput } from '../../schema/FilterAnnouncementReportSchema';
import { FilterInboxAnnouncementInput } from '../../schema/FilterInboxAnnouncementSchema';
import { FilterSentAnnouncementInput } from '../../schema/FilterSentAnnouncementSchema';
import {
  PaginatedAnnouncementReportUsersResult,
  PaginatedInboxAnnouncementsResult,
  PaginatedSentAnnouncementsResult,
} from '../../types/Announcements.types';

export interface IAnnouncementRepository {
  create(
    announcement: Announcement,
    document: Document | null,
    user: User,
  ): Promise<Announcement>;

  save(announcement: Announcement): Promise<Announcement>;

  delete(id: string): Promise<void>;

  findAll(): Promise<Announcement[]>;

  findAndCountAllInbox(
    userId: string,
    filters: FilterInboxAnnouncementInput,
  ): Promise<PaginatedInboxAnnouncementsResult>;

  findAndCountAllSent(
    userId: string,
    filters: FilterSentAnnouncementInput,
  ): Promise<PaginatedSentAnnouncementsResult>;

  findById(id: string): Promise<Announcement | null>;

  findByIdWithNoDocument(id: string): Promise<Announcement | null>;

  findAnnouncementSendersForUserId(userId: string): Promise<User[]>;

  findAnnouncementRecipients(announcementId: string): Promise<User[]>;

  findAllAssignedUsers(
    announcementId: string,
    filters: FilterAnnouncementReportInput,
    usePagination: boolean,
  ): Promise<PaginatedAnnouncementReportUsersResult>;

  findNonAcknowledgedHighAndMediumPriorityAnnouncements(
    userId: string,
  ): Promise<Announcement[]>;

  findPersistentAnnouncements(userId: string): Promise<Announcement[]>;
}
