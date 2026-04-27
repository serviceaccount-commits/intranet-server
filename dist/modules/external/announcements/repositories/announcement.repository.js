"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const Announcement_entity_1 = require("../entity/Announcement.entity");
const typeorm_1 = require("typeorm");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let AnnouncementRepository = class AnnouncementRepository {
    async create(announcement, document, user) {
        announcement.user = user;
        announcement.user_id = user.user_id;
        if (document) {
            announcement.document = document;
            announcement.document_id = document.document_id;
        }
        return await data_source_1.AppDataSource.manager.save(announcement);
    }
    async save(announcement) {
        return await data_source_1.AppDataSource.manager.save(announcement);
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(Announcement_entity_1.Announcement);
    }
    async delete(id) {
        await data_source_1.AppDataSource.manager.delete(Announcement_entity_1.Announcement, id);
    }
    async findAndCountAllInbox(userId, filters) {
        const { page, limit, search, fromId, preset, priorityLevel, startDate, endDate, } = filters;
        const queryBuilder = data_source_1.AppDataSource.manager
            .createQueryBuilder(Announcement_entity_1.Announcement, 'announcement')
            .innerJoin('announcement.assigned_to_users', // Path to the 'AnnouncementAssignedToUser' relation on Announcement entity
        'assignedToUser')
            .leftJoinAndSelect('announcement.acknowledgements', // Path to the 'AnnouncementAcknowledgement' relation on Announcement entity
        'userAcknowledgement', // Alias for the specific user's acknowledgement records
        // CRITICAL: Condition for the LEFT JOIN.
        // This ensures 'userAcknowledgement' only contains records for the specified userId.
        'userAcknowledgement.user_id = :userId')
            .where('assignedToUser.user_id = :userId', { userId: userId }) //}
            .andWhere('announcement.type = :annType', { annType: ES_1.default.REGULAR })
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
                    queryBuilder.andWhere('announcement.created_at >= :startDate AND announcement.created_at < :endDate', { startDate, endDate });
                    break;
                }
                case 'Yesterday': {
                    const today = new Date();
                    const endDate = today.toISOString().split('T')[0];
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const startDate = yesterday.toISOString().split('T')[0];
                    queryBuilder.andWhere('announcement.created_at >= :startDate AND announcement.created_at < :endDate', { startDate, endDate });
                    break;
                }
                case 'Last-7-days':
                    const last7Days = new Date();
                    last7Days.setDate(last7Days.getDate() - 7);
                    const last7 = last7Days.toISOString().split('T')[0];
                    console.log('LAST 7 DAYS: ', last7);
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
                    const last2 = last2Months.toISOString().split('T')[0];
                    console.log('LAST 2 MONTHS: ', last2);
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
        }
        else if (startDate !== undefined && endDate !== undefined) {
            console.log('START DATE: ', startDate);
            console.log('END DATE: ', endDate);
            // To make the endDate inclusive for the user, we find all records
            // created *before* the start of the *next* day.
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            const exclusiveEndDate = end.toISOString().split('T')[0];
            queryBuilder.andWhere('announcement.created_at >= :startDate AND announcement.created_at < :exclusiveEndDate', { startDate: startDate, exclusiveEndDate: exclusiveEndDate });
        }
        if (priorityLevel !== undefined && priorityLevel.length > 0) {
            queryBuilder.andWhere('announcement.priority_level IN (:...priorityLevels)', {
                priorityLevels: priorityLevel[0]?.split(','),
            });
        }
        queryBuilder.skip((page - 1) * limit).take(limit);
        const [announcements, total] = await queryBuilder.getManyAndCount(); // Executes the query
        return { announcements, total };
    }
    async findAndCountAllSent(userId, filters) {
        const { page, limit, search, preset, priorityLevel, startDate, endDate } = filters;
        const queryBuilder = data_source_1.AppDataSource.manager
            .createQueryBuilder(Announcement_entity_1.Announcement, 'announcement')
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
                    queryBuilder.andWhere('announcement.created_at >= :startDate AND announcement.created_at < :endDate', { startDate, endDate });
                    break;
                }
                case 'Yesterday': {
                    const today = new Date();
                    const endDate = today.toISOString().split('T')[0];
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const startDate = yesterday.toISOString().split('T')[0];
                    queryBuilder.andWhere('announcement.created_at >= :startDate AND announcement.created_at < :endDate', { startDate, endDate });
                    break;
                }
                case 'Last-7-days':
                    const last7Days = new Date();
                    last7Days.setDate(last7Days.getDate() - 7);
                    const last7 = last7Days.toISOString().split('T')[0];
                    console.log('LAST 7 DAYS: ', last7);
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
                    const last2 = last2Months.toISOString().split('T')[0];
                    console.log('LAST 2 MONTHS: ', last2);
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
        }
        else if (startDate !== undefined && endDate !== undefined) {
            console.log('START DATE: ', startDate);
            console.log('END DATE: ', endDate);
            // To make the endDate inclusive for the user, we find all records
            // created *before* the start of the *next* day.
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            const exclusiveEndDate = end.toISOString().split('T')[0];
            queryBuilder.andWhere('announcement.created_at >= :startDate AND announcement.created_at < :exclusiveEndDate', { startDate: startDate, exclusiveEndDate: exclusiveEndDate });
        }
        if (priorityLevel !== undefined && priorityLevel.length > 0) {
            queryBuilder.andWhere('announcement.priority_level IN (:...priorityLevels)', {
                priorityLevels: priorityLevel[0]?.split(','),
            });
        }
        queryBuilder.skip((page - 1) * limit).take(limit);
        const [announcements, total] = await queryBuilder.getManyAndCount();
        return { announcements, total };
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(Announcement_entity_1.Announcement, {
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
    async findByIdWithNoDocument(id) {
        return await data_source_1.AppDataSource.manager.findOne(Announcement_entity_1.Announcement, {
            where: {
                announcement_id: id,
            },
            relations: {
                user: true,
                acknowledgements: true,
            },
        });
    }
    async findAnnouncementSendersForUserId(userId) {
        // This query correctly finds all unique User entities ('sender') who have created an announcement
        // that was assigned to the specified 'userId'.
        return data_source_1.AppDataSource.manager
            .createQueryBuilder(User_entity_1.User, 'sender')
            .innerJoin('sender.announcements', 'announcement')
            .innerJoin('announcement.assigned_to_users', 'assignment')
            .where('assignment.user_id = :userId', { userId })
            .distinct(true)
            .orderBy('sender.first_name', 'DESC')
            .getMany();
    }
    async findAnnouncementRecipients(announcementId) {
        return data_source_1.AppDataSource.manager
            .createQueryBuilder(User_entity_1.User, 'recipient')
            .leftJoin('recipient.assignedAnnouncements', 'assignedAnnouncement')
            .where('assignedAnnouncement.announcement_id = :announcementId', {
            announcementId,
        })
            .distinct(true)
            .orderBy('recipient.first_name', 'DESC')
            .getMany();
    }
    async findAllAssignedUsers(announcementId, filters, usePagination = true) {
        const { page, limit, search } = filters;
        const queryBuilder = data_source_1.AppDataSource.manager
            .createQueryBuilder(User_entity_1.User, 'user')
            .innerJoin('user.assignedAnnouncements', 'assignment', 'assignment.announcement_id = :announcementId', { announcementId })
            .leftJoinAndSelect('user.acknowledgements', 'acknowledgements', 'acknowledgements.announcement_id = :announcementId')
            .leftJoinAndSelect('user.read', 'read', 'read.announcement_id = :announcementId')
            .orderBy('user.first_name', 'DESC');
        if (usePagination) {
            queryBuilder.skip((page - 1) * limit);
            queryBuilder.take(limit);
        }
        if (search !== undefined && search.length > 0) {
            queryBuilder.andWhere(new typeorm_1.Brackets((qb) => {
                qb.where('user.first_name ILIKE :searchName', {
                    searchName: `%${search}%`,
                }).orWhere('user.last_name ILIKE :searchLastName', {
                    searchLastName: `%${search}%`,
                });
            }));
        }
        const [users, total] = await queryBuilder.getManyAndCount();
        return { users, total };
    }
    async findNonAcknowledgedHighAndMediumPriorityAnnouncements(userId) {
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(Announcement_entity_1.Announcement, 'announcement')
            .innerJoin('announcement.assigned_to_users', // Path to the 'AnnouncementAssignedToUser' relation on Announcement entity
        'assignedToUser')
            .leftJoinAndSelect('announcement.acknowledgements', // Path to the 'AnnouncementAcknowledgement' relation on Announcement entity
        'userAcknowledgement', // Alias for the specific user's acknowledgement records
        // CRITICAL: Condition for the LEFT JOIN.
        // This ensures 'userAcknowledgement' only contains records for the specified userId.
        'userAcknowledgement.user_id = :userId')
            .where('assignedToUser.user_id = :userId', { userId: userId }) //}
            .andWhere('announcement.priority_level IN (:...priorityLevels)', {
            priorityLevels: [ES_1.default.HIGH, ES_1.default.MEDIUM],
        })
            .andWhere('userAcknowledgement.user_id IS NULL')
            .andWhere('announcement.type = :annType', { annType: ES_1.default.REGULAR })
            .orderBy('announcement.created_at', 'DESC')
            .leftJoinAndSelect('announcement.user', 'creatorUser')
            .getMany();
    }
    async findPersistentAnnouncements(userId) {
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(Announcement_entity_1.Announcement, 'announcement')
            .innerJoin('announcement.assigned_to_users', // Path to the 'AnnouncementAssignedToUser' relation on Announcement entity
        'assignedToUser')
            .leftJoinAndSelect('announcement.acknowledgements', // Path to the 'AnnouncementAcknowledgement' relation on Announcement entity
        'userAcknowledgement', // Alias for the specific user's acknowledgement records
        // CRITICAL: Condition for the LEFT JOIN.
        // This ensures 'userAcknowledgement' only contains records for the specified userId.
        'userAcknowledgement.user_id = :userId')
            .where('assignedToUser.user_id = :userId', { userId: userId }) //}
            .andWhere('userAcknowledgement.user_id IS NULL')
            .andWhere('announcement.type = :annType', { annType: ES_1.default.PERSISTENT })
            .orderBy('announcement.created_at', 'DESC')
            .leftJoinAndSelect('announcement.user', 'creatorUser')
            .getMany();
    }
};
exports.AnnouncementRepository = AnnouncementRepository;
exports.AnnouncementRepository = AnnouncementRepository = __decorate([
    (0, inversify_1.injectable)()
], AnnouncementRepository);
//# sourceMappingURL=announcement.repository.js.map