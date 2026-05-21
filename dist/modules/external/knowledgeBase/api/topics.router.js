"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topicsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const topics_controller_1 = require("../controllers/topics.controller");
const topicController = inversify_config_1.container.get(topics_controller_1.TopicController);
const topicsRouter = (0, express_1.Router)();
exports.topicsRouter = topicsRouter;
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
//# sourceMappingURL=topics.router.js.map