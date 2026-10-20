"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topicsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const topics_controller_1 = require("../controllers/topics.controller");
const permission_middleware_1 = require("../../../internal/auth/middlewares/permission.middleware");
const topicController = inversify_config_1.container.get(topics_controller_1.TopicController);
const topicsRouter = (0, express_1.Router)();
exports.topicsRouter = topicsRouter;
// Deleting folders and choosing who sees them
const canManageTopics = (0, permission_middleware_1.checkPermission)('kb:topic:manage');
topicsRouter.post('/', async (req, res, next) => {
    try {
        await topicController.createTopic(req, res);
    }
    catch (error) {
        next(error);
    }
});
// TODO: Change route /client/:clientId
topicsRouter.get('/client/:clientId', async (req, res, next) => {
    try {
        await topicController.getTopics(req, res);
    }
    catch (error) {
        next(error);
    }
});
topicsRouter.get('/:topicId', async (req, res, next) => {
    try {
        await topicController.getTopicById(req, res);
    }
    catch (error) {
        next(error);
    }
});
topicsRouter.put('/:topicId', async (req, res, next) => {
    try {
        await topicController.updateTopic(req, res);
    }
    catch (error) {
        next(error);
    }
});
topicsRouter.get('/:topicId/contents', canManageTopics, async (req, res, next) => {
    try {
        await topicController.getTopicContents(req, res);
    }
    catch (error) {
        next(error);
    }
});
topicsRouter.delete('/:topicId', canManageTopics, async (req, res, next) => {
    try {
        await topicController.deleteTopic(req, res);
    }
    catch (error) {
        next(error);
    }
});
topicsRouter.get('/:topicId/access', canManageTopics, async (req, res, next) => {
    try {
        await topicController.getTopicAccess(req, res);
    }
    catch (error) {
        next(error);
    }
});
topicsRouter.put('/:topicId/access', canManageTopics, async (req, res, next) => {
    try {
        await topicController.setTopicAccess(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=topics.router.js.map