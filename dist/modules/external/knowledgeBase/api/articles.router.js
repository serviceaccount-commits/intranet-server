"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articlesRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const articles_controller_1 = require("../controllers/articles.controller");
const articleController = inversify_config_1.container.get(articles_controller_1.ArticleController);
const articlesRouter = (0, express_1.Router)();
exports.articlesRouter = articlesRouter;
articlesRouter.get('/search', async (req, res, next) => {
    try {
        await articleController.searchArticles(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.post('/', async (req, res, next) => {
    try {
        await articleController.createArticle(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.post('/version', async (req, res, next) => {
    try {
        await articleController.createVersion(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.put('/:articleId/name', async (req, res, next) => {
    try {
        await articleController.updateArticleName(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.put('/:articleId/synopsis', async (req, res, next) => {
    try {
        await articleController.updateArticleSynopsis(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.put('/:articleId/generate-ai-synopsis', async (req, res, next) => {
    try {
        await articleController.generateAISynopsis(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.put('/:articleId/save-content', async (req, res, next) => {
    try {
        await articleController.updateArticleContent(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.post('/:articleId/save-content', async (req, res, next) => {
    try {
        await articleController.updateArticleContent(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.put('/:articleId/start-edit', async (req, res, next) => {
    try {
        await articleController.startArticleEdit(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.get('/:articleId/lock-available', async (req, res, next) => {
    try {
        await articleController.getArticleLockInfo(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.put('/:articleId/refresh-edit-lock', async (req, res, next) => {
    try {
        await articleController.refreshArticleEditLock(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.put('/unpublish-versions', async (req, res, next) => {
    try {
        await articleController.unpublishVersions(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.put('/publish-versions', async (req, res, next) => {
    try {
        await articleController.publishVersions(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.put('/:articleId/publish', async (req, res, next) => {
    try {
        await articleController.publishVersion(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.put('/:articleId/unpublish', async (req, res, next) => {
    try {
        await articleController.unpublishVersion(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.put('/move/:topicId', async (req, res, next) => {
    try {
        await articleController.moveArticleToTopic(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.put('/:articleId/close-edit-mode', async (req, res, next) => {
    try {
        await articleController.closeArticleEdit(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.post('/:articleId/close-edit-mode', async (req, res, next) => {
    try {
        await articleController.closeArticleEdit(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.get('/filters', async (req, res, next) => {
    try {
        await articleController.getArticlesFiltered(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.get('/filters/client/:clientId', async (req, res, next) => {
    try {
        await articleController.getArticlesFilteredByClientId(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.get('/external/shared-client/:sharedClientId', async (req, res, next) => {
    try {
        await articleController.getArticlesFilteredByClientId(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.get('/filters/topic/:topicId', async (req, res, next) => {
    try {
        await articleController.getArticlesFilteredByTopicId(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.get('/latests', async (req, res, next) => {
    try {
        await articleController.getLatestArticlesForUser(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.get('/topic/:topicId', async (req, res, next) => {
    try {
        await articleController.getArticles(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.get('/:articleId', async (req, res, next) => {
    try {
        await articleController.getArticleById(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.get('/:articleId/document', async (req, res, next) => {
    try {
        await articleController.getArticleDocumentById(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.get('/:articleId/versions', async (req, res, next) => {
    try {
        await articleController.getArticleVersions(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.post('/:articleId/tags/:tagId', async (req, res, next) => {
    try {
        await articleController.addTagToArticle(req, res);
    }
    catch (error) {
        next(error);
    }
});
articlesRouter.delete('/:articleId/tags/:tagId', async (req, res, next) => {
    try {
        await articleController.removeTagFromArticle(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=articles.router.js.map