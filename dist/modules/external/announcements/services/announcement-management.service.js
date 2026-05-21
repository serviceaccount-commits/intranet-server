"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementManagementService = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const Announcement_entity_1 = require("../entity/Announcement.entity");
const AnnouncementUsers_entity_1 = require("../entity/AnnouncementUsers.entity");
const CreateAnnouncementSchema_1 = require("../schema/CreateAnnouncementSchema");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const server_1 = require("../../../../server");
const ValidationError_1 = require("../../../../shared/errors/ValidationError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const typeorm_1 = require("typeorm");
let AnnouncementManagementService = class AnnouncementManagementService {
    userRepository;
    documentService;
    announcementRepository;
    constructor(userRepository, documentService, announcementRepository) {
        this.userRepository = userRepository;
        this.documentService = documentService;
        this.announcementRepository = announcementRepository;
    }
    async createAnnouncement(input, userId) {
        const validatedData = CreateAnnouncementSchema_1.CreateAnnouncementSchema.parse(input);
        const { priorityLevel } = validatedData;
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const user = await this.userRepository.findUserById(userId);
            if (!user)
                throw new Error(`User with id ${userId} does not exist.`);
            const openUntilDate = new Date();
            if (isNaN(openUntilDate.getTime())) {
                throw new ValidationError_1.ValidationError('Invalid "open_acknowledge_until" date format received.');
            }
            if (validatedData.type === ES_1.default.PERSISTENT && priorityLevel === ES_1.default.LOW) {
                throw new BusinessLogicError_1.BusinessLogicError('Persistent Announcements cannot have a Low priority ');
            }
            const newAnnouncement = new Announcement_entity_1.Announcement();
            newAnnouncement.priority_level = priorityLevel;
            newAnnouncement.title = validatedData.title;
            newAnnouncement.open_acknowledge_until = openUntilDate;
            newAnnouncement.type = validatedData.type;
            if (priorityLevel === ES_1.default.HIGH || priorityLevel === ES_1.default.MEDIUM) {
                if (!validatedData.preview || validatedData.preview.length === 0) {
                    throw new BusinessLogicError_1.BusinessLogicError('Preview is required for urgent and high priority announcements');
                }
                newAnnouncement.preview = validatedData.preview;
            }
            let document = null;
            if (!validatedData.content && validatedData.type === ES_1.default.REGULAR) {
                throw new BusinessLogicError_1.BusinessLogicError('Content is missing');
            }
            if (validatedData.type === ES_1.default.REGULAR && validatedData.content) {
                document = await this.documentService.createAnnouncementDocument(validatedData.content);
            }
            const announcement = await this.announcementRepository.create(newAnnouncement, document, user);
            if (validatedData.userIds.length === 0)
                throw new BusinessLogicError_1.BusinessLogicError('No users selected');
            const existingUsers = await this.userRepository.findUserByIds(validatedData.userIds);
            if (existingUsers.length !== validatedData.userIds.length) {
                const foundUserIds = existingUsers.map((u) => u.user_id);
                const notFoundUserIds = validatedData.userIds.filter((id) => !foundUserIds.includes(id));
                throw new NotFoundError_1.NotFoundError(`Users not found: ${notFoundUserIds.join(', ')}.`);
            }
            const existingAssignments = await data_source_1.AppDataSource.manager.find(AnnouncementUsers_entity_1.AnnouncementAssignedToUser, {
                where: { announcement_id: announcement.announcement_id, user_id: (0, typeorm_1.In)(validatedData.userIds) },
            });
            const alreadyAssignedUserIds = new Set(existingAssignments.map((a) => a.user_id));
            const assignmentsToCreate = [];
            for (const uid of validatedData.userIds) {
                if (!alreadyAssignedUserIds.has(uid)) {
                    assignmentsToCreate.push({ announcement_id: announcement.announcement_id, user_id: uid });
                }
            }
            if (assignmentsToCreate.length === 0)
                return announcement;
            const newAssignmentEntities = data_source_1.AppDataSource.manager.create(AnnouncementUsers_entity_1.AnnouncementAssignedToUser, assignmentsToCreate);
            for (const uid of validatedData.userIds) {
                const socketId = server_1.userSocketMap.get(uid);
                if (socketId) {
                    server_1.io.to(socketId).emit('newAnnouncement', {
                        announcement: {
                            announcement_id: announcement.announcement_id,
                            priority_level: announcement.priority_level,
                            created_at: announcement.created_at.toString(),
                            title: announcement.title,
                            preview: announcement.preview,
                            type: announcement.type,
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
            await data_source_1.AppDataSource.manager.save(AnnouncementUsers_entity_1.AnnouncementAssignedToUser, newAssignmentEntities);
            return announcement;
        });
    }
    async deletePersistentAnnouncement(announcementId) {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const announcement = await this.announcementRepository.findById(announcementId);
            if (!announcement)
                throw new NotFoundError_1.NotFoundError('Announcement not found', announcementId);
            if (announcement.type !== ES_1.default.PERSISTENT) {
                throw new BusinessLogicError_1.BusinessLogicError('Only persistent announcements can be deleted');
            }
            await this.announcementRepository.delete(announcementId);
            server_1.userSocketMap.forEach((socketId, _userId) => {
                server_1.io.to(socketId).emit('announcementDeleted', announcementId);
            });
        });
    }
    async updateAnnouncementRecipients(announcementId, userIds) {
        const announcement = await this.announcementRepository.findById(announcementId);
        if (!announcement)
            throw new NotFoundError_1.NotFoundError('Announcement not found', announcementId);
        if (userIds.length === 0)
            throw new BusinessLogicError_1.BusinessLogicError('No users selected');
        const allUsers = await this.userRepository.findUserByIds(userIds);
        if (allUsers.length !== userIds.length) {
            const foundUserIds = allUsers.map((u) => u.user_id);
            const notFoundUserIds = userIds.filter((id) => !foundUserIds.includes(id));
            throw new NotFoundError_1.NotFoundError(`Users not found: ${notFoundUserIds.join(', ')}.`);
        }
        const existingAnnouncements = await data_source_1.AppDataSource.manager.find(AnnouncementUsers_entity_1.AnnouncementAssignedToUser, {
            where: { announcement_id: announcement.announcement_id, user_id: (0, typeorm_1.In)(userIds) },
        });
        const alreadyAssignedUserIds = new Set(existingAnnouncements.map((a) => a.user_id));
        const assignmentsToCreate = [];
        for (const uid of userIds) {
            if (!alreadyAssignedUserIds.has(uid)) {
                assignmentsToCreate.push({ announcement_id: announcement.announcement_id, user_id: uid });
            }
        }
        if (assignmentsToCreate.length === 0)
            return;
        const newAssignmentEntities = data_source_1.AppDataSource.manager.create(AnnouncementUsers_entity_1.AnnouncementAssignedToUser, assignmentsToCreate);
        const documentContent = await this.documentService.getDocumentFromS3(announcement.document.document_id, 'announcements');
        for (const uid of assignmentsToCreate.map((a) => a.user_id)) {
            if (!uid)
                continue;
            const socketId = server_1.userSocketMap.get(uid);
            if (socketId) {
                server_1.io.to(socketId).emit('newAnnouncement', {
                    announcement: {
                        announcement_id: announcement.announcement_id,
                        priority_level: announcement.priority_level,
                        created_at: announcement.created_at.toString(),
                        title: announcement.title,
                        preview: announcement.preview,
                        type: announcement.type,
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
        await data_source_1.AppDataSource.manager.save(AnnouncementUsers_entity_1.AnnouncementAssignedToUser, newAssignmentEntities);
    }
    async findAnnouncementSenders(userId) {
        return this.announcementRepository.findAnnouncementSendersForUserId(userId);
    }
    async findAnnouncementRecipients(announcementId) {
        return this.announcementRepository.findAnnouncementRecipients(announcementId);
    }
};
exports.AnnouncementManagementService = AnnouncementManagementService;
exports.AnnouncementManagementService = AnnouncementManagementService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IDocumentService)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IAnnouncementRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], AnnouncementManagementService);
//# sourceMappingURL=announcement-management.service.js.map