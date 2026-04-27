"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topicRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const trainingTopics_controller_1 = require("../controllers/trainingTopics.controller");
const topicController = inversify_config_1.container.get(trainingTopics_controller_1.TrainingTopicController);
const topicRouter = (0, express_1.Router)();
exports.topicRouter = topicRouter;
topicRouter.post('/', async (req, res, next) => {
    try {
        await topicController.createTopic(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
topicRouter.get('/course/:courseId', async (req, res, next) => {
    try {
        await topicController.getTopics(req, res);
    }
    catch (error) {
        next(error);
    }
});
topicRouter.get('/course/:courseId', async (req, res, next) => {
    try {
        await topicController.getTopics(req, res);
    }
    catch (error) {
        next(error);
    }
});
topicRouter.get('/:topicId', async (req, res, next) => {
    try {
        await topicController.getTopicById(req, res);
    }
    catch (error) {
        next(error);
    }
});
topicRouter.get('/:topicId/classes/published/user/:userId', async (req, res, next) => {
    try {
        await topicController.getPublishedClassesForUser(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
topicRouter.put('/:topicId', async (req, res, next) => {
    try {
        await topicController.updateTopic(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=trainingTopics.router.js.map