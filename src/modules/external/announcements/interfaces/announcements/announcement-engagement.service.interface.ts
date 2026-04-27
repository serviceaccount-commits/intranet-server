import { FilterAnnouncementReportInput } from '../../schema/FilterAnnouncementReportSchema';
import { PaginatedAnnouncementReportUsers } from '../../types/Announcements.types';

export interface IAnnouncementEngagementService {
  addAcknowledgeToAnnouncement(announcementId: string, userId: string): Promise<void>;
  addReadToAnnouncement(announcementId: string, userId: string): Promise<void>;
  getAnnouncementReport(
    announcementId: string,
    filters: FilterAnnouncementReportInput,
    usePagination?: boolean,
  ): Promise<PaginatedAnnouncementReportUsers>;
}
