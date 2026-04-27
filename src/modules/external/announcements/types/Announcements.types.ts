import ES from '../../../../shared/types/enum/ES';
import { User } from '../../../internal/users/entities/User.entity';
import { SmallUser } from '../../../internal/users/types/Users.types';
import { Announcement } from '../entity/Announcement.entity';
import { AnnouncementAcknowledgement } from '../entity/AnnouncementAcknowledgement.entity';

export interface PaginatedInboxAnnouncementsResult {
  announcements: Announcement[];
  total: number;
}

interface UserSmall {
  user_id: string;
  first_name: string;
  last_name: string;
}

export interface InboxAnnouncement {
  announcement_id: string;
  priority_level: ES.HIGH | ES.MEDIUM | ES.LOW;
  created_at: string;
  title: string;
  preview: string;
  open_acknowledge_until: string;
  user: UserSmall;
  acknowledgements: AnnouncementAcknowledgement[];
  type: ES.REGULAR | ES.PERSISTENT;
}

export interface PaginatedSentAnnouncementsResult {
  announcements: Announcement[];
  total: number;
}

export interface PaginatedAnnouncementWithContentResult {
  announcements: InboxAnnouncement[];
  total: number;
}

export interface AnnouncementWithContent {
  announcement: Announcement;
  content: string;
}

export interface AnnouncementUserReportExport {
  user_id: string;
  full_name: string;
  status: string;
  last_update: string;
}

export interface NameReportsToUser {
  user_id: string;
  first_name: string;
  last_name: string;
}

export interface AcknowledgedUser {
  user: NameReportsToUser;
  acknowledged_at: Date;
}

export interface ReadUser {
  user: NameReportsToUser;
  read_at: Date;
}

export interface AnnouncementReportUsers {
  acknowledgedUsers: AcknowledgedUser[];
  readUsers: ReadUser[];
  notReadYetUsers: NameReportsToUser[];
}

export interface PaginatedAnnouncementReportUsers {
  announcementReportUsers: AnnouncementReportUsers;
  total: number;
}

export interface PaginatedAnnouncementReportUsersResult {
  users: User[];
  total: number;
}

export interface InboxAnnouncementWithContent {
  announcement: InboxAnnouncement;
  content: string;
  preview: string;
}

export interface InboxAnnouncement {
  announcement_id: string;
  priority_level: ES.HIGH | ES.MEDIUM | ES.LOW;
  created_at: string;
  title: string;
  open_acknowledge_until: string;
  user: SmallUser;
  acknowledgements: AnnouncementAcknowledgement[];
}

export interface BannerAnnouncements {
  regular: Announcement[];
  persistent: Announcement[];
}
