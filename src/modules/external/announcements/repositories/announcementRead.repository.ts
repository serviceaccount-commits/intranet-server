import { injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { IAnnouncementReadRepository } from '../interfaces/announcements/announcementRead.repository.interface';
import { AnnouncementRead } from '../entity/AnnouncementRead.entity';

@injectable()
export class AnnouncementReadRepository implements IAnnouncementReadRepository {
  async create(announcementRead: AnnouncementRead): Promise<void> {
    await AppDataSource.manager.save(announcementRead);
  }

  async findByAnnouncementAndUserId(
    announcementId: string,
    userId: string,
  ): Promise<AnnouncementRead | null> {
    return await AppDataSource.manager.findOne(AnnouncementRead, {
      where: { user_id: userId, announcement_id: announcementId },
      relations: {
        announcement: true,
        user: true,
      },
    });
  }

  async findAll(): Promise<AnnouncementRead[]> {
    return await AppDataSource.manager.find(AnnouncementRead);
  }

  async findAllByAnnouncementId(
    announcementId: string,
  ): Promise<AnnouncementRead[]> {
    return await AppDataSource.manager.find(AnnouncementRead, {
      where: { announcement_id: announcementId },
      relations: {
        announcement: true,
        user: true,
      },
    });
  }
}
