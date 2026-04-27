import { inject, injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IUserRepository } from '../../../internal/users/interfaces/users/user.repository.interface';
import { IDocumentService } from '../../../internal/documents/interfaces/documents.service.interface';
import { IAnnouncementRepository } from '../interfaces/announcements/announcement.repository.interface';
import { IAnnouncementManagementService } from '../interfaces/announcements/announcement-management.service.interface';
import { Announcement } from '../entity/Announcement.entity';
import { AnnouncementAssignedToUser } from '../entity/AnnouncementUsers.entity';
import { User } from '../../../internal/users/entities/User.entity';
import {
  CreateAnnouncementInput,
  CreateAnnouncementSchema,
} from '../schema/CreateAnnouncementSchema';
import ES from '../../../../shared/types/enum/ES';
import { io, userSocketMap } from '../../../../server';
import { ValidationError } from '../../../../shared/errors/ValidationError';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { In } from 'typeorm';

@injectable()
export class AnnouncementManagementService implements IAnnouncementManagementService {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IDocumentService) private documentService: IDocumentService,
    @inject(TYPES.IAnnouncementRepository)
    private announcementRepository: IAnnouncementRepository,
  ) {}

  async createAnnouncement(input: CreateAnnouncementInput, userId: string): Promise<Announcement> {
    const validatedData = CreateAnnouncementSchema.parse(input);
    const { priorityLevel } = validatedData;

    return await AppDataSource.manager.transaction(async (_t) => {
      const user: User | null = await this.userRepository.findUserById(userId);
      if (!user) throw new Error(`User with id ${userId} does not exist.`);

      const openUntilDate = new Date();
      if (isNaN(openUntilDate.getTime())) {
        throw new ValidationError('Invalid "open_acknowledge_until" date format received.');
      }

      if (validatedData.type === ES.PERSISTENT && priorityLevel === ES.LOW) {
        throw new BusinessLogicError('Persistent Announcements cannot have a Low priority ');
      }

      const newAnnouncement = new Announcement();
      newAnnouncement.priority_level = priorityLevel as ES.HIGH | ES.MEDIUM | ES.LOW;
      newAnnouncement.title = validatedData.title;
      newAnnouncement.open_acknowledge_until = openUntilDate;
      newAnnouncement.type = validatedData.type as ES.REGULAR | ES.PERSISTENT;

      if (priorityLevel === ES.HIGH || priorityLevel === ES.MEDIUM) {
        if (!validatedData.preview || validatedData.preview.length === 0) {
          throw new BusinessLogicError('Preview is required for urgent and high priority announcements');
        }
        newAnnouncement.preview = validatedData.preview;
      }

      let document = null;
      if (!validatedData.content && validatedData.type === ES.REGULAR) {
        throw new BusinessLogicError('Content is missing');
      }
      if (validatedData.type === ES.REGULAR && validatedData.content) {
        document = await this.documentService.createAnnouncementDocument(validatedData.content);
      }

      const announcement = await this.announcementRepository.create(newAnnouncement, document, user);

      if (validatedData.userIds.length === 0) throw new BusinessLogicError('No users selected');

      const existingUsers = await this.userRepository.findUserByIds(validatedData.userIds);
      if (existingUsers.length !== validatedData.userIds.length) {
        const foundUserIds = existingUsers.map((u) => u.user_id);
        const notFoundUserIds = validatedData.userIds.filter((id) => !foundUserIds.includes(id));
        throw new NotFoundError(`Users not found: ${notFoundUserIds.join(', ')}.`);
      }

      const existingAssignments = await AppDataSource.manager.find(AnnouncementAssignedToUser, {
        where: { announcement_id: announcement.announcement_id, user_id: In(validatedData.userIds) },
      });
      const alreadyAssignedUserIds = new Set(existingAssignments.map((a) => a.user_id));

      const assignmentsToCreate: Partial<AnnouncementAssignedToUser>[] = [];
      for (const uid of validatedData.userIds) {
        if (!alreadyAssignedUserIds.has(uid)) {
          assignmentsToCreate.push({ announcement_id: announcement.announcement_id, user_id: uid });
        }
      }

      if (assignmentsToCreate.length === 0) return announcement;

      const newAssignmentEntities = AppDataSource.manager.create(
        AnnouncementAssignedToUser,
        assignmentsToCreate,
      );

      for (const uid of validatedData.userIds) {
        const socketId = userSocketMap.get(uid);
        if (socketId) {
          io.to(socketId).emit('newAnnouncement', {
            announcement: {
              announcement_id: announcement.announcement_id,
              priority_level: announcement.priority_level as ES.HIGH | ES.MEDIUM | ES.LOW,
              created_at: announcement.created_at.toString(),
              title: announcement.title,
              preview: announcement.preview,
              type: announcement.type as ES.REGULAR | ES.PERSISTENT,
              open_acknowledge_until: '',
              user: {
                user_id: announcement.user.user_id,
                first_name: announcement.user.first_name,
                last_name: announcement.user.last_name,
              },
              acknowledgements: [],
            },
            content: validatedData.content ?? '',
            preview: validatedData.preview ?? '',
          });
        }
      }

      await AppDataSource.manager.save(AnnouncementAssignedToUser, newAssignmentEntities);
      return announcement;
    });
  }

  async deletePersistentAnnouncement(announcementId: string): Promise<void> {
    await AppDataSource.manager.transaction(async (_t) => {
      const announcement = await this.announcementRepository.findById(announcementId);
      if (!announcement) throw new NotFoundError('Announcement not found', announcementId);
      if (announcement.type !== ES.PERSISTENT) {
        throw new BusinessLogicError('Only persistent announcements can be deleted');
      }

      await this.announcementRepository.delete(announcementId);

      userSocketMap.forEach((socketId, _userId) => {
        io.to(socketId).emit('announcementDeleted', announcementId);
      });
    });
  }

  async updateAnnouncementRecipients(announcementId: string, userIds: string[]): Promise<void> {
    const announcement = await this.announcementRepository.findById(announcementId);
    if (!announcement) throw new NotFoundError('Announcement not found', announcementId);
    if (userIds.length === 0) throw new BusinessLogicError('No users selected');

    const allUsers = await this.userRepository.findUserByIds(userIds);
    if (allUsers.length !== userIds.length) {
      const foundUserIds = allUsers.map((u) => u.user_id);
      const notFoundUserIds = userIds.filter((id) => !foundUserIds.includes(id));
      throw new NotFoundError(`Users not found: ${notFoundUserIds.join(', ')}.`);
    }

    const existingAnnouncements = await AppDataSource.manager.find(AnnouncementAssignedToUser, {
      where: { announcement_id: announcement.announcement_id, user_id: In(userIds) },
    });
    const alreadyAssignedUserIds = new Set(existingAnnouncements.map((a) => a.user_id));

    const assignmentsToCreate: Partial<AnnouncementAssignedToUser>[] = [];
    for (const uid of userIds) {
      if (!alreadyAssignedUserIds.has(uid)) {
        assignmentsToCreate.push({ announcement_id: announcement.announcement_id, user_id: uid });
      }
    }

    if (assignmentsToCreate.length === 0) return;

    const newAssignmentEntities = AppDataSource.manager.create(
      AnnouncementAssignedToUser,
      assignmentsToCreate,
    );

    const documentContent = await this.documentService.getDocumentFromS3(
      announcement.document.document_id,
      'announcements',
    );

    for (const uid of assignmentsToCreate.map((a) => a.user_id)) {
      if (!uid) continue;
      const socketId = userSocketMap.get(uid);
      if (socketId) {
        io.to(socketId).emit('newAnnouncement', {
          announcement: {
            announcement_id: announcement.announcement_id,
            priority_level: announcement.priority_level as ES.HIGH | ES.MEDIUM | ES.LOW,
            created_at: announcement.created_at.toString(),
            title: announcement.title,
            preview: announcement.preview,
            type: announcement.type as ES.REGULAR | ES.PERSISTENT,
            open_acknowledge_until: '',
            user: {
              user_id: announcement.user.user_id,
              first_name: announcement.user.first_name,
              last_name: announcement.user.last_name,
            },
            acknowledgements: announcement.acknowledgements || [],
          },
          content: documentContent,
          preview: announcement.preview ?? '',
        });
      }
    }

    await AppDataSource.manager.save(AnnouncementAssignedToUser, newAssignmentEntities);
  }

  async findAnnouncementSenders(userId: string): Promise<User[]> {
    return this.announcementRepository.findAnnouncementSendersForUserId(userId);
  }

  async findAnnouncementRecipients(announcementId: string): Promise<User[]> {
    return this.announcementRepository.findAnnouncementRecipients(announcementId);
  }
}
