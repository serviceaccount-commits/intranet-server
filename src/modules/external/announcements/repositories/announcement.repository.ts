import { injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { User } from '../../../internal/users/entities/User.entity';
import { Document } from '../../../internal/documents/entities/Document.entity';
import { IAnnouncementRepository } from '../interfaces/announcements/announcement.repository.interface';
import { Announcement } from '../entity/Announcement.entity';
import { FilterInboxAnnouncementInput } from '../schema/FilterInboxAnnouncementSchema';
import {
  PaginatedAnnouncementReportUsersResult,
  PaginatedInboxAnnouncementsResult,
  PaginatedSentAnnouncementsResult,
} from '../types/Announcements.types';
import { FilterSentAnnouncementInput } from '../schema/FilterSentAnnouncementSchema';
import { FilterAnnouncementReportInput } from '../schema/FilterAnnouncementReportSchema';
import { Brackets } from 'typeorm';
import ES from '../../../../shared/types/enum/ES';

@injectable()
export class AnnouncementRepository implements IAnnouncementRepository {
  async create(
    announcement: Announcement,
    document: Document | null,
    user: User,
  ): Promise<Announcement> {
    announcement.user = user;
    announcement.user_id = user.user_id;

    if (document) {
      announcement.document = document;

      announcement.document_id = document.document_id;
    }
    return await AppDataSource.manager.save(announcement);
  }

  async save(announcement: Announcement): Promise<Announcement> {
    return await AppDataSource.manager.save(announcement);
  }

  async findAll(): Promise<Announcement[]> {
    return await AppDataSource.manager.find(Announcement);
  }

  async delete(id: string): Promise<void> {
    await AppDataSource.manager.delete(Announcement, id);
  }

  async findAndCountAllInbox(
    userId: string,
    filters: FilterInboxAnnouncementInput,
  ): Promise<PaginatedInboxAnnouncementsResult> {
    const {
      page,
      limit,
      search,
      fromId,
      preset,
      priorityLevel,
      startDate,
      endDate,
    } = filters;

    const queryBuilder = AppDataSource.manager
      .createQueryBuilder(Announcement, 'announcement')
      .innerJoin(
        'announcement.assigned_to_users', // Path to the 'AnnouncementAssignedToUser' relation on Announcement entity
        'assignedToUser', // Alias for the 'AnnouncementAssignedToUser' join entity instances
        // The join condition between 'announcement' and 'assignedToUser' is inferred by TypeORM from the relation
      )
      .leftJoinAndSelect(
        'announcement.acknowledgements', // Path to the 'AnnouncementAcknowledgement' relation on Announcement entity
        'userAcknowledgement', // Alias for the specific user's acknowledgement records
        // CRITICAL: Condition for the LEFT JOIN.
        // This ensures 'userAcknowledgement' only contains records for the specified userId.
        'userAcknowledgement.user_id = :userId',
      )
      .where('assignedToUser.user_id = :userId', { userId: userId }) //}
      .andWhere('announcement.type = :annType', { annType: ES.REGULAR })
      .orderBy('announcement.created_at', 'DESC')
      .leftJoinAndSelect('announcement.user', 'creatorUser'); // User who created the announcement

    if (search !== undefined && search.length > 0) {
      queryBuilder.andWhere('announcement.title ILIKE :searchName', {
        searchName: `%${search}%`,
      });
    }

    if (fromId !== undefined && fromId.length > 0) {
      queryBuilder.andWhere('announcement.user_id IN (:...fromIds)', {
        fromIds: fromId[0]?.split(','),
      });
    }
    if (preset !== undefined) {
      switch (preset) {
        case 'Today': {
          const today = new Date();
          const startDate = today.toISOString().split('T')[0];
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const endDate = tomorrow.toISOString().split('T')[0];
          queryBuilder.andWhere(
            'announcement.created_at >= :startDate AND announcement.created_at < :endDate',
            { startDate, endDate },
          );
          break;
        }
        case 'Yesterday': {
          const today = new Date();
          const endDate = today.toISOString().split('T')[0];
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const startDate = yesterday.toISOString().split('T')[0];
          queryBuilder.andWhere(
            'announcement.created_at >= :startDate AND announcement.created_at < :endDate',
            { startDate, endDate },
          );
          break;
        }
        case 'Last-7-days':
          const last7Days = new Date();
          last7Days.setDate(last7Days.getDate() - 7);
          queryBuilder.andWhere('announcement.created_at >= :startDate', {
            startDate: last7Days.toISOString().split('T')[0],
          });
          break;
        case 'Last-30-days':
          const last30Days = new Date();
          last30Days.setDate(last30Days.getDate() - 30);
          queryBuilder.andWhere('announcement.created_at >= :startDate', {
            startDate: last30Days.toISOString().split('T')[0],
          });
          break;
        case 'Last-2-months':
          const last2Months = new Date();
          last2Months.setMonth(last2Months.getMonth() - 2);
          queryBuilder.andWhere('announcement.created_at >= :startDate', {
            startDate: last2Months.toISOString().split('T')[0],
          });
          break;
        case 'Last-6-months':
          const last6Months = new Date();
          last6Months.setMonth(last6Months.getMonth() - 6);
          queryBuilder.andWhere('announcement.created_at >= :startDate', {
            startDate: last6Months.toISOString().split('T')[0],
          });
          break;
        default:
          break;
      }
    } else if (startDate !== undefined && endDate !== undefined) {

      // To make the endDate inclusive for the user, we find all records
      // created *before* the start of the *next* day.
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      const exclusiveEndDate = end.toISOString().split('T')[0];

      queryBuilder.andWhere(
        'announcement.created_at >= :startDate AND announcement.created_at < :exclusiveEndDate',
        { startDate: startDate, exclusiveEndDate: exclusiveEndDate },
      );
    }

    if (priorityLevel !== undefined && priorityLevel.length > 0) {
      queryBuilder.andWhere(
        'announcement.priority_level IN (:...priorityLevels)',
        {
          priorityLevels: priorityLevel[0]?.split(','),
        },
      );
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [announcements, total] = await queryBuilder.getManyAndCount(); // Executes the query

    return { announcements, total };
  }

  async findAndCountAllSent(
    userId: string,
    filters: FilterSentAnnouncementInput,
  ): Promise<PaginatedSentAnnouncementsResult> {
    const { page, limit, search, preset, priorityLevel, startDate, endDate } =
      filters;

    const queryBuilder = AppDataSource.manager
      .createQueryBuilder(Announcement, 'announcement')
      .leftJoinAndSelect('announcement.user', 'user')
      .leftJoinAndSelect('announcement.document', 'document')
      .where('user.user_id = :userId', { userId: userId })
      .orderBy('announcement.created_at', 'DESC');

    if (search !== undefined && search.length > 0) {
      queryBuilder.andWhere('announcement.title ILIKE :searchName', {
        searchName: `%${search}%`,
      });
    }

    if (preset !== undefined) {
      switch (preset) {
        case 'Today': {
          const today = new Date();
          const startDate = today.toISOString().split('T')[0];
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const endDate = tomorrow.toISOString().split('T')[0];
          queryBuilder.andWhere(
            'announcement.created_at >= :startDate AND announcement.created_at < :endDate',
            { startDate, endDate },
          );
          break;
        }
        case 'Yesterday': {
          const today = new Date();
          const endDate = today.toISOString().split('T')[0];
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const startDate = yesterday.toISOString().split('T')[0];
          queryBuilder.andWhere(
            'announcement.created_at >= :startDate AND announcement.created_at < :endDate',
            { startDate, endDate },
          );
          break;
        }
        case 'Last-7-days':
          const last7Days = new Date();
          last7Days.setDate(last7Days.getDate() - 7);
          queryBuilder.andWhere('announcement.created_at >= :startDate', {
            startDate: last7Days.toISOString().split('T')[0],
          });
          break;
        case 'Last-30-days':
          const last30Days = new Date();
          last30Days.setDate(last30Days.getDate() - 30);
          queryBuilder.andWhere('announcement.created_at >= :startDate', {
            startDate: last30Days.toISOString().split('T')[0],
          });
          break;
        case 'Last-2-months':
          const last2Months = new Date();
          last2Months.setMonth(last2Months.getMonth() - 2);
          queryBuilder.andWhere('announcement.created_at >= :startDate', {
            startDate: last2Months.toISOString().split('T')[0],
          });
          break;
        case 'Last-6-months':
          const last6Months = new Date();
          last6Months.setMonth(last6Months.getMonth() - 6);
          queryBuilder.andWhere('announcement.created_at >= :startDate', {
            startDate: last6Months.toISOString().split('T')[0],
          });
          break;
        default:
          break;
      }
    } else if (startDate !== undefined && endDate !== undefined) {

      // To make the endDate inclusive for the user, we find all records
      // created *before* the start of the *next* day.
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      const exclusiveEndDate = end.toISOString().split('T')[0];

      queryBuilder.andWhere(
        'announcement.created_at >= :startDate AND announcement.created_at < :exclusiveEndDate',
        { startDate: startDate, exclusiveEndDate: exclusiveEndDate },
      );
    }

    if (priorityLevel !== undefined && priorityLevel.length > 0) {
      queryBuilder.andWhere(
        'announcement.priority_level IN (:...priorityLevels)',
        {
          priorityLevels: priorityLevel[0]?.split(','),
        },
      );
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [announcements, total] = await queryBuilder.getManyAndCount();

    return { announcements, total };
  }

  async findById(id: string): Promise<Announcement | null> {
    return await AppDataSource.manager.findOne(Announcement, {
      where: {
        announcement_id: id,
      },
      relations: {
        user: true,
        document: true,
        acknowledgements: true,
      },
    });
  }

  async findByIdWithNoDocument(id: string): Promise<Announcement | null> {
    return await AppDataSource.manager.findOne(Announcement, {
      where: {
        announcement_id: id,
      },
      relations: {
        user: true,
        acknowledgements: true,
      },
    });
  }

  async findAnnouncementSendersForUserId(userId: string): Promise<User[]> {
    // This query correctly finds all unique User entities ('sender') who have created an announcement
    // that was assigned to the specified 'userId'.
    return AppDataSource.manager
      .createQueryBuilder(User, 'sender')
      .innerJoin('sender.announcements', 'announcement')
      .innerJoin('announcement.assigned_to_users', 'assignment')
      .where('assignment.user_id = :userId', { userId })
      .distinct(true)
      .orderBy('sender.first_name', 'DESC')
      .getMany();
  }

  async findAnnouncementRecipients(announcementId: string): Promise<User[]> {
    return AppDataSource.manager
      .createQueryBuilder(User, 'recipient')
      .leftJoin('recipient.assignedAnnouncements', 'assignedAnnouncement')
      .where('assignedAnnouncement.announcement_id = :announcementId', {
        announcementId,
      })
      .distinct(true)
      .orderBy('recipient.first_name', 'DESC')
      .getMany();
  }

  async findAllAssignedUsers(
    announcementId: string,
    filters: FilterAnnouncementReportInput,
    usePagination: boolean = true,
  ): Promise<PaginatedAnnouncementReportUsersResult> {
    const { page, limit, search } = filters;

    const queryBuilder = AppDataSource.manager
      .createQueryBuilder(User, 'user')
      .innerJoin(
        'user.assignedAnnouncements',
        'assignment',
        'assignment.announcement_id = :announcementId',
        { announcementId },
      )
      .leftJoinAndSelect(
        'user.acknowledgements',
        'acknowledgements',
        'acknowledgements.announcement_id = :announcementId',
      )
      .leftJoinAndSelect(
        'user.read',
        'read',
        'read.announcement_id = :announcementId',
      )
      .orderBy('user.first_name', 'DESC');

    if (usePagination) {
      queryBuilder.skip((page - 1) * limit);
      queryBuilder.take(limit);
    }

    if (search !== undefined && search.length > 0) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.first_name ILIKE :searchName', {
            searchName: `%${search}%`,
          }).orWhere('user.last_name ILIKE :searchLastName', {
            searchLastName: `%${search}%`,
          });
        }),
      );
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return { users, total };
  }

  async findNonAcknowledgedHighAndMediumPriorityAnnouncements(
    userId: string,
  ): Promise<Announcement[]> {
    return await AppDataSource.manager
      .createQueryBuilder(Announcement, 'announcement')
      .innerJoin(
        'announcement.assigned_to_users', // Path to the 'AnnouncementAssignedToUser' relation on Announcement entity
        'assignedToUser', // Alias for the 'AnnouncementAssignedToUser' join entity instances
        // The join condition between 'announcement' and 'assignedToUser' is inferred by TypeORM from the relation
      )
      .leftJoinAndSelect(
        'announcement.acknowledgements', // Path to the 'AnnouncementAcknowledgement' relation on Announcement entity
        'userAcknowledgement', // Alias for the specific user's acknowledgement records
        // CRITICAL: Condition for the LEFT JOIN.
        // This ensures 'userAcknowledgement' only contains records for the specified userId.
        'userAcknowledgement.user_id = :userId',
      )
      .where('assignedToUser.user_id = :userId', { userId: userId }) //}
      .andWhere('announcement.priority_level IN (:...priorityLevels)', {
        priorityLevels: [ES.HIGH, ES.MEDIUM],
      })
      .andWhere('userAcknowledgement.user_id IS NULL')
      .andWhere('announcement.type = :annType', { annType: ES.REGULAR })
      .orderBy('announcement.created_at', 'DESC')
      .leftJoinAndSelect('announcement.user', 'creatorUser')
      .getMany();
  }

  async findPersistentAnnouncements(userId: string): Promise<Announcement[]> {
    return await AppDataSource.manager
      .createQueryBuilder(Announcement, 'announcement')
      .innerJoin(
        'announcement.assigned_to_users', // Path to the 'AnnouncementAssignedToUser' relation on Announcement entity
        'assignedToUser', // Alias for the 'AnnouncementAssignedToUser' join entity instances
        // The join condition between 'announcement' and 'assignedToUser' is inferred by TypeORM from the relation
      )
      .leftJoinAndSelect(
        'announcement.acknowledgements', // Path to the 'AnnouncementAcknowledgement' relation on Announcement entity
        'userAcknowledgement', // Alias for the specific user's acknowledgement records
        // CRITICAL: Condition for the LEFT JOIN.
        // This ensures 'userAcknowledgement' only contains records for the specified userId.
        'userAcknowledgement.user_id = :userId',
      )
      .where('assignedToUser.user_id = :userId', { userId: userId }) //}
      .andWhere('userAcknowledgement.user_id IS NULL')
      .andWhere('announcement.type = :annType', { annType: ES.PERSISTENT })
      .orderBy('announcement.created_at', 'DESC')
      .leftJoinAndSelect('announcement.user', 'creatorUser')
      .getMany();
  }
}
