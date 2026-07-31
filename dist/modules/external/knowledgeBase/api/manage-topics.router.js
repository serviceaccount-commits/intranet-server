"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageTopicsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const manage_topics_controller_1 = require("../controllers/manage-topics.controller");
const manageTopicsController = inversify_config_1.container.get(manage_topics_controller_1.ManageTopicsController);
const manageTopicsRouter = (0, express_1.Router)();
exports.manageTopicsRouter = manageTopicsRouter;
manageTopicsRouter.post('/:clientSharedId', async (req, res, next) => {
    try {
        await manageTopicsController.createTopic(req, res);
    }
    catch (error) {
        next(error);
    }
});
manageTopicsRouter.put('/:clientSharedId/:topicId', async (req, res, next) => {
    try {
        await manageTopicsController.updateTopic(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=manage-topics.router.js.map