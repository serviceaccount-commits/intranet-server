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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementEngagementService = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const AnnouncementAcknowledgement_entity_1 = require("../entity/AnnouncementAcknowledgement.entity");
const AnnouncementRead_entity_1 = require("../entity/AnnouncementRead.entity");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
let AnnouncementEngagementService = class AnnouncementEngagementService {
    userRepository;
    announcementRepository;
    announcementAcknowledgementRepository;
    announcementReadRepository;
    constructor(userRepository, announcementRepository, announcementAcknowledgementRepository, announcementReadRepository) {
        this.userRepository = userRepository;
        this.announcementRepository = announcementRepository;
        this.announcementAcknowledgementRepository = announcementAcknowledgementRepository;
        this.announcementReadRepository = announcementReadRepository;
    }
    async addAcknowledgeToAnnouncement(announcementId, userId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const existingAcknowledge = await this.announcementAcknowledgementRepository.findByAnnouncementAndUserId(announcementId, userId);
            if (existingAcknowledge)
                return;
            const user = await this.userRepository.findUserById(userId);
            if (!user)
                throw new NotFoundError_1.NotFoundError('User', userId);
            const announcement = await this.announcementRepository.findById(announcementId);
            if (!announcement)
                throw new NotFoundError_1.NotFoundError('Announcement', announcementId);
            const newAnnAck = new AnnouncementAcknowledgement_entity_1.AnnouncementAcknowledgement();
            await this.announcementAcknowledgementRepository.create(newAnnAck, announcement, user);
        });
    }
    async addReadToAnnouncement(announcementId, userId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const existingRead = await this.announcementReadRepository.findByAnnouncementAndUserId(announcementId, userId);
            if (existingRead)
                return;
            const user = await this.userRepository.findUserById(userId);
            if (!user)
                throw new NotFoundError_1.NotFoundError('User', userId);
            const announcement = await this.announcementRepository.findById(announcementId);
            if (!announcement)
                throw new NotFoundError_1.NotFoundError('Announcement', announcementId);
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
                    user: { user_id: user.user_id, first_name: user.first_name, last_name: user.last_name },
                    acknowledged_at: acknowledgement.created_at,
                });
                continue;
            }
            else if (user.read?.findIndex((a) => a.announcement_id === announcementId) !== -1 &&
                status.findIndex((s) => s === 'read') !== -1) {
                const read = user.read?.find((a) => a.announcement_id === announcementId);
                if (!read)
                    continue;
                const acknowledgement = user.acknowledgements?.find((a) => a.announcement_id === announcementId);
                if (acknowledgement)
                    continue;
                readUsers.push({
                    user: { user_id: user.user_id, first_name: user.first_name, last_name: user.last_name },
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
                acknowledgedUsers,
                readUsers,
                notReadYetUsers: nothingUsers,
            },
            total: assignedUsers.total,
        };
    }
};
exports.AnnouncementEngagementService = AnnouncementEngagementService;
exports.AnnouncementEngagementService = AnnouncementEngagementService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IAnnouncementRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IAnnouncementAcknowledgementRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.IAnnouncementReadRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AnnouncementEngagementService);
//# sourceMappingURL=announcement-engagement.service.js.map