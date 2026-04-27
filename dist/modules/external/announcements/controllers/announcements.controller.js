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
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const FilterInboxAnnouncementSchema_1 = require("../schema/FilterInboxAnnouncementSchema");
const zod_1 = require("zod");
const FilterSentAnnouncementSchema_1 = require("../schema/FilterSentAnnouncementSchema");
const FilterAnnouncementReportSchema_1 = require("../schema/FilterAnnouncementReportSchema");
const convertToCsv_1 = require("../../../../shared/utils/convertToCsv");
const getFormattedDate_1 = require("../../../../shared/utils/getFormattedDate");
let AnnouncementController = class AnnouncementController {
    announcementService;
    constructor(announcementService) {
        this.announcementService = announcementService;
    }
    async createAnnouncement(req, res) {
        //! should update userId so that it gets retrieved via jwt cookie
        const input = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        const announcement = await this.announcementService.createAnnouncement(input, userId);
        return res.json(announcement);
    }
    async deletePersistentAnnouncement(req, res) {
        const { announcementId } = req.params;
        if (!announcementId) {
            res.sendStatus(400);
            return;
        }
        try {
            await this.announcementService.deletePersistentAnnouncement(announcementId);
            return res.sendStatus(200);
        }
        catch (error) { }
    }
    async updateAnnouncementRecipients(req, res) {
        //! should update userId so that it gets retrieved via jwt cookie
        const { userIds } = req.body;
        const { announcementId } = req.params;
        const userId = req.user?.id;
        if (!userId || !userIds || !announcementId) {
            res.sendStatus(400);
            return;
        }
        const announcement = await this.announcementService.updateAnnouncementRecipients(announcementId, userIds);
        return res.json(announcement);
    }
    async addAcknowledgeToAnnouncement(req, res) {
        let { announcementId } = req.params;
        const userId = req.user?.id;
        if (!announcementId || !userId) {
            res.sendStatus(400);
            return;
        }
        const announcement = await this.announcementService.addAcknowledgeToAnnouncement(announcementId, userId);
        return res.json(announcement);
    }
    async addReadToAnnouncement(req, res) {
        let { announcementId } = req.params;
        const userId = req.user?.id;
        if (!announcementId || !userId) {
            res.sendStatus(400);
            return;
        }
        const announcement = await this.announcementService.addReadToAnnouncement(announcementId, userId);
        return res.json(announcement);
    }
    async getAnnouncements(_req, res) {
        const announcement = await this.announcementService.getAnnouncements();
        return res.json(announcement);
    }
    async getInbox(req, res, next) {
        const validationResult = FilterInboxAnnouncementSchema_1.FilterInboxAnnouncementSchema.parse(req.query);
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.sendStatus(400);
                return;
            }
            const result = await this.announcementService.getInbox(userId, validationResult);
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
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
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
            const result = await this.announcementService.getSent(userId, validationResult);
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
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            next(error);
        }
    }
    async getAnnouncementById(req, res) {
        const { announcementId } = req.params;
        if (!announcementId) {
            res.sendStatus(400);
            return;
        }
        const announcement = await this.announcementService.getAnnouncementById(announcementId);
        return res.json(announcement);
    }
    async findAnnouncementSenders(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        const users = await this.announcementService.findAnnouncementSenders(userId);
        return res.json(users);
    }
    async getAnnouncementRecipients(req, res) {
        const userId = req.user?.id;
        const { announcementId } = req.params;
        if (!userId || !announcementId) {
            res.sendStatus(400);
            return;
        }
        const users = await this.announcementService.findAnnouncementRecipients(announcementId);
        return res.json(users);
    }
    async getAnnouncementReport(req, res) {
        const validationResult = FilterAnnouncementReportSchema_1.FilterAnnouncementReportSchema.parse(req.query);
        const userId = req.user?.id;
        const { announcementId } = req.params;
        if (!userId || !announcementId) {
            res.sendStatus(400);
            return;
        }
        const users = await this.announcementService.getAnnouncementReport(announcementId, validationResult, true);
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
        const userId = req.user?.id;
        const { announcementId } = req.params;
        try {
            if (!userId || !announcementId) {
                res.sendStatus(400);
                return;
            }
            const users = await this.announcementService.getAnnouncementReport(announcementId, validationResult, false);
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
            const formattedDate = (0, getFormattedDate_1.getFilenameTimestamp)();
            const fileName = `announcement-report-${formattedDate}.csv`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.status(200).send(csvString);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            next(error);
        }
    }
    async getAnnouncementCleanContent(req, res) {
        const userId = req.user?.id;
        const { announcementId } = req.params;
        if (!userId || !announcementId) {
            res.sendStatus(400);
            return;
        }
        const cleanContent = await this.announcementService.getAnnouncementCleanContent(announcementId);
        return res.json(cleanContent);
    }
    async findBannerAnnouncements(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        console.log('USER ID IS');
        console.log(userId);
        const announcements = await this.announcementService.findBannerAnnouncements(userId);
        return res.json(announcements);
    }
};
exports.AnnouncementController = AnnouncementController;
exports.AnnouncementController = AnnouncementController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IAnnouncementService)),
    __metadata("design:paramtypes", [Object])
], AnnouncementController);
//# sourceMappingURL=announcements.controller.js.map