import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IDocumentService } from '../../../internal/documents/interfaces/documents.service.interface';
import { IAnnouncementRepository } from '../interfaces/announcements/announcement.repository.interface';
import { IAnnouncementInboxService } from '../interfaces/announcements/announcement-inbox.service.interface';
import { Announcement } from '../entity/Announcement.entity';
import { FilterInboxAnnouncementInput } from '../schema/FilterInboxAnnouncementSchema';
import { FilterSentAnnouncementInput } from '../schema/FilterSentAnnouncementSchema';
import {
  AnnouncementWithContent,
  BannerAnnouncements,
  InboxAnnouncement,
  PaginatedAnnouncementWithContentResult,
  PaginatedInboxAnnouncementsResult,
} from '../types/Announcements.types';
import ES from '../../../../shared/types/enum/ES';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import * as cheerio from 'cheerio';

@injectable()
export class AnnouncementInboxService implements IAnnouncementInboxService {
  constructor(
    @inject(TYPES.IAnnouncementRepository)
    private announcementRepository: IAnnouncementRepository,
    @inject(TYPES.IDocumentService) private documentService: IDocumentService,
  ) {}

  async getAnnouncements(): Promise<Announcement[]> {
    return this.announcementRepository.findAll();
  }

  async getInbox(
    userId: string,
    filters: FilterInboxAnnouncementInput,
  ): Promise<PaginatedInboxAnnouncementsResult> {
    return this.announcementRepository.findAndCountAllInbox(userId, filters);
  }

  async getSent(
    userId: string,
    filters: FilterSentAnnouncementInput,
  ): Promise<PaginatedAnnouncementWithContentResult> {
    const ann = await this.announcementRepository.findAndCountAllSent(userId, filters);

    const announcements: InboxAnnouncement[] = [];

    for (const a of ann.announcements) {
      if (a.type === ES.REGULAR) {
        if (!a.document) continue;
        announcements.push({
          announcement_id: a.announcement_id,
          priority_level: a.priority_level as ES.HIGH | ES.MEDIUM | ES.LOW,
          created_at: a.created_at.toISOString(),
          title: a.title,
          preview: await this.getAnnouncementCleanContent(a.announcement_id),
          open_acknowledge_until: a.open_acknowledge_until.toISOString(),
          user: {
            user_id: a.user.user_id,
            first_name: a.user.first_name,
            last_name: a.user.last_name,
          },
          acknowledgements: a.acknowledgements || [],
          type: a.type,
        });
      }

      if (a.type === ES.PERSISTENT) {
        announcements.push({
          announcement_id: a.announcement_id,
          priority_level: a.priority_level as ES.HIGH | ES.MEDIUM | ES.LOW,
          created_at: a.created_at.toISOString(),
          title: a.title,
          preview: a.preview,
          open_acknowledge_until: a.open_acknowledge_until.toISOString(),
          user: {
            user_id: a.user.user_id,
            first_name: a.user.first_name,
            last_name: a.user.last_name,
          },
          acknowledgements: a.acknowledgements || [],
          type: a.type,
        });
      }
    }

    return { announcements, total: ann.total };
  }

  async getAnnouncementById(announcementId: string): Promise<AnnouncementWithContent> {
    const announcement = await this.announcementRepository.findByIdWithNoDocument(announcementId);
    if (!announcement) {
      throw new Error(`Announcement with id ${announcementId} does not exist.`);
    }

    let fileContent = '';
    if (announcement.type === ES.REGULAR) {
      const announcementWithDocument = await this.announcementRepository.findById(announcementId);
      if (!announcementWithDocument) throw new NotFoundError('Announcement', announcementId);
      if (!announcementWithDocument.document) throw new NotFoundError('Announcement Document', announcementId);

      fileContent = await this.documentService.getDocumentFromS3(
        announcementWithDocument.document.document_id,
        'announcements',
      );
    } else {
      fileContent = announcement.preview;
    }

    return { announcement, content: fileContent };
  }

  async getAnnouncementCleanContent(announcementId: string): Promise<string> {
    const announcement = await this.announcementRepository.findById(announcementId);
    if (!announcement) throw new NotFoundError('Announcement not found', announcementId);

    const rawContent = await this.documentService.getDocumentFromS3(
      announcement.document.document_id,
      'announcements',
    );

    const $ = cheerio.load(rawContent);
    $('p, li, h1, h2, h3, div, th, td, blockquote').after(' ');
    const text = $('body').text();
    const cleanText = text.replace(/\s+/g, ' ').trim();

    if (!cleanText) throw new BusinessLogicError('Invalid input format');

    return cleanText;
  }

  async findBannerAnnouncements(userId: string): Promise<BannerAnnouncements> {
    const regularAnn =
      await this.announcementRepository.findNonAcknowledgedHighAndMediumPriorityAnnouncements(userId);
    const persistentAnn = await this.announcementRepository.findPersistentAnnouncements(userId);

    return { regular: regularAnn, persistent: persistentAnn };
  }
}
