"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminTopicsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const articles_controller_1 = require("../controllers/articles.controller");
const articleController = inversify_config_1.container.get(articles_controller_1.ArticleController);
const adminTopicsRouter = (0, express_1.Router)();
exports.adminTopicsRouter = adminTopicsRouter;
adminTopicsRouter.get('/:clientSharedId', async (req, res, next) => {
    try {
        await articleController.getAdminClientTopics(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=admin-topics.router.js.map