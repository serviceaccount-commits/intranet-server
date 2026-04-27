import { User } from '../../../../internal/users/entities/User.entity';
import { Announcement } from '../../entity/Announcement.entity';
import { AnnouncementAcknowledgement } from '../../entity/AnnouncementAcknowledgement.entity';

export interface IAnnouncementAcknowledgementRepository {
  create(
    announcementAcknowledgement: AnnouncementAcknowledgement,
    announcement: Announcement,
    user: User,
  ): Promise<void>;

  findAll(): Promise<AnnouncementAcknowledgement[]>;

  findByAnnouncementAndUserId(
    announcementId: string,
    userId: string,
  ): Promise<AnnouncementAcknowledgement | null>;
}
