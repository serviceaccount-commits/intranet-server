"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageArticlesRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const manage_articles_controller_1 = require("../controllers/manage-articles.controller");
const manageArticlesController = inversify_config_1.container.get(manage_articles_controller_1.ManageArticlesController);
const manageArticlesRouter = (0, express_1.Router)();
exports.manageArticlesRouter = manageArticlesRouter;
manageArticlesRouter.post('/:clientSharedId', async (req, res, next) => {
    try {
        await manageArticlesController.createArticle(req, res);
    }
    catch (error) {
        next(error);
    }
});
manageArticlesRouter.put('/:clientSharedId/:versionId', async (req, res, next) => {
    try {
        await manageArticlesController.updateArticle(req, res);
    }
    catch (error) {
        next(error);
    }
});
manageArticlesRouter.delete('/:clientSharedId/:versionId', async (req, res, next) => {
    try {
        await manageArticlesController.archiveArticle(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=manage-articles.router.js.map