import { AnnouncementRead } from '../../entity/AnnouncementRead.entity';

export interface IAnnouncementReadRepository {
  create(announcementRead: AnnouncementRead): Promise<void>;

  findAll(): Promise<AnnouncementRead[]>;

  findByAnnouncementAndUserId(
    announcementId: string,
    userId: string,
  ): Promise<AnnouncementRead | null>;

  findAllByAnnouncementId(announcementId: string): Promise<AnnouncementRead[]>;
}
