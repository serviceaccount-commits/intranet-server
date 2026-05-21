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
exports.AnnouncementController = void 0;
const inversify_1 = require("inversify");
const zod_1 = require("zod");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const FilterInboxAnnouncementSchema_1 = require("../schema/FilterInboxAnnouncementSchema");
const FilterSentAnnouncementSchema_1 = require("../schema/FilterSentAnnouncementSchema");
const FilterAnnouncementReportSchema_1 = require("../schema/FilterAnnouncementReportSchema");
const convertToCsv_1 = require("../../../../shared/utils/convertToCsv");
const getFormattedDate_1 = require("../../../../shared/utils/getFormattedDate");
let AnnouncementController = class AnnouncementController {
    inboxService;
    managementService;
    engagementService;
    constructor(inboxService, managementService, engagementService) {
        this.inboxService = inboxService;
        this.managementService = managementService;
        this.engagementService = engagementService;
    }
    // ─── Management ───────────────────────────────────────────────────────────────
    async createAnnouncement(req, res) {
        const input = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        const announcement = await this.managementService.createAnnouncement(input, userId);
        return res.json(announcement);
    }
    async deletePersistentAnnouncement(req, res) {
        const { announcementId } = req.params;
        if (!announcementId) {
            res.sendStatus(400);
            return;
        }
        try {
            await this.managementService.deletePersistentAnnouncement(announcementId);
            return res.sendStatus(200);
        }
        catch (error) {
            return res.status(500).json({ message: 'Failed to delete announcement' });
        }
    }
    async updateAnnouncementRecipients(req, res) {
        const { userIds } = req.body;
        const { announcementId } = req.params;
        const userId = req.user?.id;
        if (!userId || !userIds || !announcementId) {
            res.sendStatus(400);
            return;
        }
        await this.managementService.updateAnnouncementRecipients(announcementId, userIds);
        return res.sendStatus(200);
    }
    async findAnnouncementSenders(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        const users = await this.managementService.findAnnouncementSenders(userId);
        return res.json(users);
    }
    async getAnnouncementRecipients(req, res) {
        const { announcementId } = req.params;
        if (!announcementId) {
            res.sendStatus(400);
            return;
        }
        const users = await this.managementService.findAnnouncementRecipients(announcementId);
        return res.json(users);
    }
    // ─── Inbox ────────────────────────────────────────────────────────────────────
    async getAnnouncements(_req, res) {
        const announcements = await this.inboxService.getAnnouncements();
        return res.json(announcements);
    }
    async getInbox(req, res, next) {
        const validationResult = FilterInboxAnnouncementSchema_1.FilterInboxAnnouncementSchema.parse(req.query);
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.sendStatus(400);
                return;
            }
            const result = await this.inboxService.getInbox(userId, validationResult);
            return res.json({
                data: result,
                pagination: {
                    totalItems: result.total,
                    currentPage: validationResult.page,
                    itemsPerPage: validationResult.limit,
                    totalPages: Math.ceil(result.total / validationResult.limit),
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError)
                return res.status(400).json(error);
            next(error);
        }
    }
    async getSent(req, res, next) {
        const validationResult = FilterSentAnnouncementSchema_1.FilterSentAnnouncementSchema.parse(req.query);
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.sendStatus(400);
                return;
            }
            const result = await this.inboxService.getSent(userId, validationResult);
            return res.json({
                data: result,
                pagination: {
                    totalItems: result.total,
                    currentPage: validationResult.page,
                    itemsPerPage: validationResult.limit,
                    totalPages: Math.ceil(result.total / validationResult.limit),
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError)
                return res.status(400).json(error);
            next(error);
        }
    }
    async getAnnouncementById(req, res) {
        const { announcementId } = req.params;
        if (!announcementId) {
            res.sendStatus(400);
            return;
        }
        const announcement = await this.inboxService.getAnnouncementById(announcementId);
        return res.json(announcement);
    }
    async getAnnouncementCleanContent(req, res) {
        const { announcementId } = req.params;
        const userId = req.user?.id;
        if (!userId || !announcementId) {
            res.sendStatus(400);
            return;
        }
        const cleanContent = await this.inboxService.getAnnouncementCleanContent(announcementId);
        return res.json(cleanContent);
    }
    async findBannerAnnouncements(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        const announcements = await this.inboxService.findBannerAnnouncements(userId);
        return res.json(announcements);
    }
    // ─── Engagement ───────────────────────────────────────────────────────────────
    async addAcknowledgeToAnnouncement(req, res) {
        const { announcementId } = req.params;
        const userId = req.user?.id;
        if (!announcementId || !userId) {
            res.sendStatus(400);
            return;
        }
        await this.engagementService.addAcknowledgeToAnnouncement(announcementId, userId);
        return res.sendStatus(200);
    }
    async addReadToAnnouncement(req, res) {
        const { announcementId } = req.params;
        const userId = req.user?.id;
        if (!announcementId || !userId) {
            res.sendStatus(400);
            return;
        }
        await this.engagementService.addReadToAnnouncement(announcementId, userId);
        return res.sendStatus(200);
    }
    async getAnnouncementReport(req, res) {
        const validationResult = FilterAnnouncementReportSchema_1.FilterAnnouncementReportSchema.parse(req.query);
        const { announcementId } = req.params;
        const userId = req.user?.id;
        if (!userId || !announcementId) {
            res.sendStatus(400);
            return;
        }
        const users = await this.engagementService.getAnnouncementReport(announcementId, validationResult, true);
        return res.json({
            data: users.announcementReportUsers,
            pagination: {
                totalItems: users.total,
                currentPage: validationResult.page,
                itemsPerPage: validationResult.limit,
                totalPages: Math.ceil(users.total / validationResult.limit),
            },
        });
    }
    async exportAnnouncementReportWithFilter(req, res, next) {
        const validationResult = FilterAnnouncementReportSchema_1.FilterAnnouncementReportSchema.parse(req.query);
        const { announcementId } = req.params;
        const userId = req.user?.id;
        try {
            if (!userId || !announcementId) {
                res.sendStatus(400);
                return;
            }
            const users = await this.engagementService.getAnnouncementReport(announcementId, validationResult, false);
            const headerMapping = {
                user_id: 'User ID',
                full_name: 'Full Name',
                status: 'Status',
                last_update: 'Last Update',
            };
            const data = [];
            for (const user of users.announcementReportUsers.acknowledgedUsers) {
                data.push({
                    user_id: user.user.user_id,
                    full_name: `${user.user.first_name} ${user.user.last_name}`,
                    status: 'Acknowledged',
                    last_update: (0, getFormattedDate_1.getFormattedDate)(user.acknowledged_at.toString(), true, false),
                });
            }
            for (const user of users.announcementReportUsers.readUsers) {
                data.push({
                    user_id: user.user.user_id,
                    full_name: `${user.user.first_name} ${user.user.last_name}`,
                    status: 'Read',
                    last_update: (0, getFormattedDate_1.getFormattedDate)(user.read_at.toString(), true, false),
                });
            }
            for (const user of users.announcementReportUsers.notReadYetUsers) {
                data.push({
                    user_id: user.user_id,
                    full_name: `${user.first_name} ${user.last_name}`,
                    status: 'Not Read Yet',
                    last_update: '--',
                });
            }
            const csvString = (0, convertToCsv_1.convertToCsv)(data, headerMapping);
            const fileName = `announcement-report-${(0, getFormattedDate_1.getFilenameTimestamp)()}.csv`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.status(200).send(csvString);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError)
                return res.status(400).json(error);
            next(error);
        }
    }
};
exports.AnnouncementController = AnnouncementController;
exports.AnnouncementController = AnnouncementController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IAnnouncementInboxService)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IAnnouncementManagementService)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IAnnouncementEngagementService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], AnnouncementController);
//# sourceMappingURL=announcements.controller.js.map