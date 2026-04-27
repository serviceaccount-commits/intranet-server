"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const announcements_controller_1 = require("../controllers/announcements.controller");
const announcementController = inversify_config_1.container.get(announcements_controller_1.AnnouncementController);
const announcementsRouter = (0, express_1.Router)();
exports.announcementsRouter = announcementsRouter;
announcementsRouter.post('/', async (req, res, next) => {
    try {
        await announcementController.createAnnouncement(req, res);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.put('/:announcementId', async (req, res, next) => {
    try {
        await announcementController.updateAnnouncementRecipients(req, res);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.delete('/persistent/:announcementId', async (req, res, next) => {
    try {
        await announcementController.deletePersistentAnnouncement(req, res);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.post('/acknowledge/:announcementId', async (req, res, next) => {
    try {
        await announcementController.addAcknowledgeToAnnouncement(req, res);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.post('/read/:announcementId', async (req, res, next) => {
    try {
        await announcementController.addReadToAnnouncement(req, res);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.get('/', async (req, res, next) => {
    try {
        await announcementController.getAnnouncements(req, res);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.get('/inbox', async (req, res, next) => {
    try {
        await announcementController.getInbox(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.get('/sent', async (req, res, next) => {
    try {
        await announcementController.getSent(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.get('/:announcementId', async (req, res, next) => {
    try {
        await announcementController.getAnnouncementById(req, res);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.get('/:announcementId/clean-content', async (req, res, next) => {
    try {
        await announcementController.getAnnouncementCleanContent(req, res);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.get('/:announcementId/recipients', async (req, res, next) => {
    try {
        await announcementController.getAnnouncementRecipients(req, res);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.get('/:announcementId/report', async (req, res, next) => {
    try {
        await announcementController.getAnnouncementReport(req, res);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.get('/:announcementId/export-report', async (req, res, next) => {
    try {
        await announcementController.exportAnnouncementReportWithFilter(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.get('/senders/users', async (req, res, next) => {
    try {
        await announcementController.findAnnouncementSenders(req, res);
    }
    catch (error) {
        next(error);
    }
});
announcementsRouter.get('/non-acknowledged/banner', async (req, res, next) => {
    try {
        await announcementController.findBannerAnnouncements(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=announcements.router.js.map