import { Announcement } from '../../entity/Announcement.entity';
import { User } from '../../../../internal/users/entities/User.entity';
import { CreateAnnouncementInput } from '../../schema/CreateAnnouncementSchema';

export interface IAnnouncementManagementService {
  createAnnouncement(input: CreateAnnouncementInput, userId: string): Promise<Announcement>;
  deletePersistentAnnouncement(announcementId: string): Promise<void>;
  updateAnnouncementRecipients(announcementId: string, userIds: string[]): Promise<void>;
  findAnnouncementSenders(userId: string): Promise<User[]>;
  findAnnouncementRecipients(announcementId: string): Promise<User[]>;
}
