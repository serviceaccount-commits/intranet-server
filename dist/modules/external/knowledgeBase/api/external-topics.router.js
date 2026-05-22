"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalTopicsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const articles_controller_1 = require("../controllers/articles.controller");
const articleController = inversify_config_1.container.get(articles_controller_1.ArticleController);
const externalTopicsRouter = (0, express_1.Router)();
exports.externalTopicsRouter = externalTopicsRouter;
externalTopicsRouter.get('/:clientSharedId', async (req, res, next) => {
    try {
        await articleController.getExternalClientTopics(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=external-topics.router.js.map