import { injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { IAnnouncementAcknowledgementRepository } from '../interfaces/announcements/announcementAcknowledgement.repository.interface';
import { AnnouncementAcknowledgement } from '../entity/AnnouncementAcknowledgement.entity';
import { User } from '../../../internal/users/entities/User.entity';
import { Announcement } from '../entity/Announcement.entity';

@injectable()
export class AnnouncementAcknowledgementRepository
  implements IAnnouncementAcknowledgementRepository
{
  async create(
    announcementAcknowledgement: AnnouncementAcknowledgement,
    announcement: Announcement,
    user: User,
  ): Promise<void> {
    announcementAcknowledgement.user = user;
    announcementAcknowledgement.user_id = user.user_id;

    announcementAcknowledgement.announcement = announcement;
    announcementAcknowledgement.announcement_id = announcement.announcement_id;

    await AppDataSource.manager.save(announcementAcknowledgement);
  }

  async findByAnnouncementAndUserId(
    announcementId: string,
    userId: string,
  ): Promise<AnnouncementAcknowledgement | null> {
    return await AppDataSource.manager.findOne(AnnouncementAcknowledgement, {
      where: { user_id: userId, announcement_id: announcementId },
      relations: {
        announcement: true,
        user: true,
      },
    });
  }

  async findAll(): Promise<AnnouncementAcknowledgement[]> {
    return await AppDataSource.manager.find(AnnouncementAcknowledgement);
  }
}
