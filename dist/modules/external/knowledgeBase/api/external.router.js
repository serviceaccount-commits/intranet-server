"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const articles_controller_1 = require("../controllers/articles.controller");
const articleController = inversify_config_1.container.get(articles_controller_1.ArticleController);
const externalRouter = (0, express_1.Router)();
exports.externalRouter = externalRouter;
externalRouter.get('/:clientSharedId', async (req, res, next) => {
    try {
        await articleController.getExternalClientArticles(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
externalRouter.get('/:clientSharedId/:articleId', async (req, res, next) => {
    try {
        await articleController.getExternalClientArticleDetails(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=external.router.js.map