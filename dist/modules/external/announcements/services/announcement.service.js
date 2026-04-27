"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.AnnouncementService = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const Announcement_entity_1 = require("../entity/Announcement.entity");
const AnnouncementAcknowledgement_entity_1 = require("../entity/AnnouncementAcknowledgement.entity");
const CreateAnnouncementSchema_1 = require("../schema/CreateAnnouncementSchema");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const server_1 = require("../../../../server");
const ValidationError_1 = require("../../../../shared/errors/ValidationError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const AnnouncementUsers_entity_1 = require("../entity/AnnouncementUsers.entity");
const typeorm_1 = require("typeorm");
const AnnouncementRead_entity_1 = require("../entity/AnnouncementRead.entity");
const cheerio = __importStar(require("cheerio"));
let AnnouncementService = class AnnouncementService {
    userRepository;
    documentService;
    announcementRepository;
    announcementAcknowledgementRepository;
    announcementReadRepository;
    constructor(userRepository, documentService, announcementRepository, announcementAcknowledgementRepository, announcementReadRepository) {
        this.userRepository = userRepository;
        this.documentService = documentService;
        this.announcementRepository = announcementRepository;
        this.announcementAcknowledgementRepository = announcementAcknowledgementRepository;
        this.announcementReadRepository = announcementReadRepository;
    }
    async createAnnouncement(input, userId) {
        const validatedData = CreateAnnouncementSchema_1.CreateAnnouncementSchema.parse(input);
        const { priorityLevel } = validatedData;
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new Error(`User with id ${userId} does not exist.`);
            }
            const openUntilDate = new Date();
            if (isNaN(openUntilDate.getTime())) {
                throw new ValidationError_1.ValidationError('Invalid "open_acknowledge_until" date format received.');
            }
            // const nowUtc = new Date();
            // if (openUntilDate.getTime() <= nowUtc.getTime()) {
            //   throw new BusinessLogicError(
            //     'Open acknowledge date must be in the future.',
            //   );
            // }
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
            // if (priorityLevel === ES.HIGH) {
            //   io.emit('newAnnouncement', 'new high priority announcement!');
            // } else if (priorityLevel === ES.MEDIUM) {
            //   io.emit('newAnnouncement', 'new medium priority announcement!');
            // } else if (priorityLevel === ES.LOW) {
            //   io.emit('newAnnouncement', 'new low priority announcement!');
            // }
            let document = null;
            if (!validatedData.content && validatedData.type === ES_1.default.REGULAR) {
                throw new BusinessLogicError_1.BusinessLogicError('Content is missing');
            }
            if (validatedData.type === ES_1.default.REGULAR && validatedData.content) {
                document = await this.documentService.createAnnouncementDocument(validatedData.content);
            }
            const announcement = await this.announcementRepository.create(newAnnouncement, document, user);
            if (validatedData.userIds.length === 0) {
                throw new BusinessLogicError_1.BusinessLogicError('No users selected');
            }
            const existingUsers = await this.userRepository.findUserByIds(validatedData.userIds);
            if (existingUsers.length !== validatedData.userIds.length) {
                const foundUserIds = existingUsers.map((u) => u.user_id);
                const notFoundUserIds = validatedData.userIds.filter((id) => !foundUserIds.includes(id));
                throw new NotFoundError_1.NotFoundError(`Users not found: ${notFoundUserIds.join(', ')}.`);
            }
            const existingAssignments = await data_source_1.AppDataSource.manager.find(AnnouncementUsers_entity_1.AnnouncementAssignedToUser, {
                where: {
                    announcement_id: announcement.announcement_id,
                    user_id: (0, typeorm_1.In)(validatedData.userIds),
                },
            });
            const alreadyAssignedUserIds = new Set(existingAssignments.map((a) => a.user_id));
            const assignmentsToCreate = [];
            for (const userId of validatedData.userIds) {
                if (!alreadyAssignedUserIds.has(userId)) {
                    assignmentsToCreate.push({
                        announcement_id: announcement.announcement_id, // Or use `announcement: announcement` if you prefer object assignment
                        user_id: userId, // Or use `user: { user_id: userId }`
                    });
                }
            }
            if (assignmentsToCreate.length === 0) {
                // All users were already assigned, or no new valid users to assign // Still commit as the operation (checking) was successful
                console.log('No new users to assign to the announcement.');
                return announcement; // Or return existing assignments if that's the requirement
            }
            const newAssignmentEntities = data_source_1.AppDataSource.manager.create(AnnouncementUsers_entity_1.AnnouncementAssignedToUser, assignmentsToCreate);
            for (const userId of validatedData.userIds) {
                const socketId = server_1.userSocketMap.get(userId);
                if (socketId) {
                    console.log(`Sending announcement to user ${userId} on socket ${socketId}`);
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
                else {
                    console.log(`User ${userId} is not online. Skipping`);
                }
            }
            await data_source_1.AppDataSource.manager.save(AnnouncementUsers_entity_1.AnnouncementAssignedToUser, // Pass the entity class when saving an array of partials
            newAssignmentEntities);
            return announcement;
        });
    }
    async deletePersistentAnnouncement(announcementId) {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const announcement = await this.announcementRepository.findById(announcementId);
            if (!announcement) {
                throw new NotFoundError_1.NotFoundError('Announcement not found', announcementId);
            }
            if (announcement.type !== ES_1.default.PERSISTENT) {
                throw new BusinessLogicError_1.BusinessLogicError('Only persistent announcements can be deleted');
            }
            await this.announcementRepository.delete(announcementId);
            console.log('Sending announcement deleted to all users');
            server_1.userSocketMap.forEach((socketId, _userId) => {
                console.log(`Sending announcement deleted to user ${_userId} on socket ${socketId}`);
                server_1.io.to(socketId).emit('announcementDeleted', announcementId);
            });
        });
    }
    async updateAnnouncementRecipients(announcementId, userIds) {
        const announcement = await this.announcementRepository.findById(announcementId);
        if (!announcement) {
            throw new NotFoundError_1.NotFoundError('Announcement not found', announcementId);
        }
        if (userIds.length === 0) {
            throw new BusinessLogicError_1.BusinessLogicError('No users selected');
        }
        const allUsers = await this.userRepository.findUserByIds(userIds);
        if (allUsers.length !== userIds.length) {
            const foundUserIds = allUsers.map((u) => u.user_id);
            const notFoundUserIds = userIds.filter((id) => !foundUserIds.includes(id));
            throw new NotFoundError_1.NotFoundError(`Users not found: ${notFoundUserIds.join(', ')}.`);
        }
        const existingAnnouncements = await data_source_1.AppDataSource.manager.find(AnnouncementUsers_entity_1.AnnouncementAssignedToUser, {
            where: {
                announcement_id: announcement.announcement_id,
                user_id: (0, typeorm_1.In)(userIds),
            },
        });
        const alreadyAssignedUserIds = new Set(existingAnnouncements.map((a) => a.user_id));
        const assignmentsToCreate = [];
        for (const userId of userIds) {
            if (!alreadyAssignedUserIds.has(userId)) {
                assignmentsToCreate.push({
                    announcement_id: announcement.announcement_id,
                    user_id: userId,
                });
            }
        }
        if (assignmentsToCreate.length === 0) {
            // All users were already assigned, or no new valid users to assign // Still commit as the operation (checking) was successful
            console.log('No new users to assign to the announcement.');
            return; // Or return existing assignments if that's the requirement
        }
        const newAssignmentEntities = data_source_1.AppDataSource.manager.create(AnnouncementUsers_entity_1.AnnouncementAssignedToUser, assignmentsToCreate);
        // const documentContent = await this.documentService.getLocalDocument(
        //   announcement.document.document_id,
        //   'announcements',
        // );
        const documentContent = await this.documentService.getDocumentFromS3(announcement.document.document_id, 'announcements');
        for (const userId of assignmentsToCreate.map((a) => a.user_id)) {
            if (!userId)
                continue;
            const socketId = server_1.userSocketMap.get(userId);
            if (socketId) {
                console.log(`Sending announcement to user ${userId} on socket ${socketId}`);
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
            else {
                console.log(`User ${userId} is not online. Skipping`);
            }
        }
        await data_source_1.AppDataSource.manager.save(AnnouncementUsers_entity_1.AnnouncementAssignedToUser, // Pass the entity class when saving an array of partials
        newAssignmentEntities);
        return;
    }
    async addAcknowledgeToAnnouncement(announcementId, userId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const existingAcknowledge = await this.announcementAcknowledgementRepository.findByAnnouncementAndUserId(announcementId, userId);
            if (existingAcknowledge) {
                return;
            }
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new NotFoundError_1.NotFoundError('User', userId);
            }
            const announcement = await this.announcementRepository.findById(announcementId);
            if (!announcement) {
                throw new NotFoundError_1.NotFoundError(`Announcement`, announcementId);
            }
            const newAnnAck = new AnnouncementAcknowledgement_entity_1.AnnouncementAcknowledgement();
            await this.announcementAcknowledgementRepository.create(newAnnAck, announcement, user);
        });
    }
    async addReadToAnnouncement(announcementId, userId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const existingRead = await this.announcementReadRepository.findByAnnouncementAndUserId(announcementId, userId);
            if (existingRead) {
                return;
            }
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new NotFoundError_1.NotFoundError('User', userId);
            }
            const announcement = await this.announcementRepository.findById(announcementId);
            if (!announcement) {
                throw new NotFoundError_1.NotFoundError('Announcement', announcementId);
            }
            const newRead = new AnnouncementRead_entity_1.AnnouncementRead();
            newRead.announcement = announcement;
            newRead.announcement_id = announcement.announcement_id;
            newRead.user = user;
            newRead.user_id = user.user_id;
            await this.announcementReadRepository.create(newRead);
        });
    }
    async getAnnouncementReport(announcementId, filters, usePagination = true) {
        const assignedUsers = await this.announcementRepository.findAllAssignedUsers(announcementId, filters, usePagination);
        console.log(assignedUsers);
        let status = [];
        if (filters.status !== undefined) {
            status = filters.status[0]?.split(',') ?? [];
        }
        const acknowledgedUsers = [];
        const readUsers = [];
        const nothingUsers = [];
        for (const user of assignedUsers.users) {
            if (user.acknowledgements?.findIndex((a) => a.announcement_id === announcementId) !== -1 &&
                status.findIndex((s) => s === 'acknowledged') !== -1) {
                const acknowledgement = user.acknowledgements?.find((a) => a.announcement_id === announcementId);
                if (!acknowledgement)
                    continue;
                acknowledgedUsers.push({
                    user: {
                        user_id: user.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                    },
                    acknowledged_at: acknowledgement.created_at,
                });
                continue;
            }
            else if (user.read?.findIndex((a) => a.announcement_id === announcementId) !==
                -1 &&
                status.findIndex((s) => s === 'read') !== -1) {
                const read = user.read?.find((a) => a.announcement_id === announcementId);
                if (!read)
                    continue;
                const acknowledgement = user.acknowledgements?.find((a) => a.announcement_id === announcementId);
                if (acknowledgement)
                    continue;
                readUsers.push({
                    user: {
                        user_id: user.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                    },
                    read_at: read.created_at,
                });
                continue;
            }
            else if (status.findIndex((s) => s === 'not-read-yet') !== -1) {
                const read = user.read?.find((a) => a.announcement_id === announcementId);
                if (read)
                    continue;
                const acknowledgement = user.acknowledgements?.find((a) => a.announcement_id === announcementId);
                if (acknowledgement)
                    continue;
                nothingUsers.push({
                    user_id: user.user_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                });
            }
        }
        return {
            announcementReportUsers: {
                acknowledgedUsers: acknowledgedUsers,
                readUsers: readUsers,
                notReadYetUsers: nothingUsers,
            },
            total: assignedUsers.total,
        };
    }
    async getAnnouncements() {
        return await this.announcementRepository.findAll();
    }
    async getInbox(userId, filters) {
        return await this.announcementRepository.findAndCountAllInbox(userId, filters);
    }
    async getSent(userId, filters) {
        const ann = await this.announcementRepository.findAndCountAllSent(userId, filters);
        let announcements = [];
        for (const a of ann.announcements) {
            if (a.type === ES_1.default.REGULAR) {
                console.log(a);
                if (!a.document)
                    continue;
                announcements.push({
                    announcement_id: a.announcement_id,
                    priority_level: a.priority_level,
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
            if (a.type === ES_1.default.PERSISTENT) {
                announcements.push({
                    announcement_id: a.announcement_id,
                    priority_level: a.priority_level,
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
        return {
            announcements: announcements,
            total: ann.total,
        };
    }
    async findBannerAnnouncements(userId) {
        const regularAnn = await this.announcementRepository.findNonAcknowledgedHighAndMediumPriorityAnnouncements(userId);
        const persistentAnn = await this.announcementRepository.findPersistentAnnouncements(userId);
        return {
            regular: regularAnn,
            persistent: persistentAnn,
        };
    }
    async getAnnouncementById(announcementId) {
        const announcement = await this.announcementRepository.findByIdWithNoDocument(announcementId);
        if (!announcement) {
            throw new Error(`Announcement with id ${announcementId} does not exist.`);
        }
        let fileContent = '';
        if (announcement.type === ES_1.default.REGULAR) {
            const announcementWithDocument = await this.announcementRepository.findById(announcementId);
            if (!announcementWithDocument) {
                throw new NotFoundError_1.NotFoundError(`Announcement`, announcementId);
            }
            if (!announcementWithDocument.document) {
                throw new NotFoundError_1.NotFoundError(`Announcement Document`, announcementId);
            }
            fileContent = await this.documentService.getDocumentFromS3(announcementWithDocument.document.document_id, 'announcements');
        }
        else {
            fileContent = announcement.preview;
        }
        // const fileContent = await this.documentService.getLocalDocument(
        //   announcement.document.document_id,
        //   'announcements',
        // );
        return { announcement: announcement, content: fileContent };
    }
    async findAnnouncementSenders(userId) {
        return await this.announcementRepository.findAnnouncementSendersForUserId(userId);
    }
    async getAnnouncementCleanContent(announcementId) {
        const announcement = await this.announcementRepository.findById(announcementId);
        if (!announcement) {
            throw new NotFoundError_1.NotFoundError('Announcement not found', announcementId);
        }
        const rawContent = await this.documentService.getDocumentFromS3(announcement.document.document_id, 'announcements');
        const $ = cheerio.load(rawContent);
        // ✅ NEW: Add a space after common block-level elements to ensure separation.
        // This prevents words from different list items, paragraphs, or table cells from merging.
        $('p, li, h1, h2, h3, div, th, td, blockquote').after(' ');
        // Now, extract the text. The injected spaces will be included.
        const text = $('body').text();
        // The existing cleanup logic will normalize all whitespace into single spaces.
        const cleanText = text.replace(/\s+/g, ' ').trim();
        if (!cleanText) {
            throw new BusinessLogicError_1.BusinessLogicError('Invalid input format');
        }
        return cleanText;
    }
    async findAnnouncementRecipients(announcementId) {
        return await this.announcementRepository.findAnnouncementRecipients(announcementId);
    }
};
exports.AnnouncementService = AnnouncementService;
exports.AnnouncementService = AnnouncementService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IDocumentService)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IAnnouncementRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.IAnnouncementAcknowledgementRepository)),
    __param(4, (0, inversify_1.inject)(containerTypes_1.TYPES.IAnnouncementReadRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], AnnouncementService);
//# sourceMappingURL=announcement.service.js.map