import { InboxAnnouncementWithContent } from '../../modules/external/announcements/types/Announcements.types';

export interface ServerToClientEvents {
  newAnnouncement: (announcement: InboxAnnouncementWithContent) => void;
  announcementDeleted: (announcementId: string) => void;
}
