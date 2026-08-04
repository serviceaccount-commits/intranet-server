"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleController = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const FilterArticleSchema_1 = require("../schema/articles/FilterArticleSchema");
const zod_1 = require("zod");
const AppError_1 = require("../../../../shared/errors/AppError");
const articleSearch_service_1 = require("../services/articleSearch.service");
const kbAccess_service_1 = require("../services/kbAccess.service");
const kb_domain_types_1 = require("../database/kb-domain.types");
let ArticleController = class ArticleController {
    articleService;
    searchService;
    kbAccess;
    constructor(articleService, searchService, kbAccess) {
        this.articleService = articleService;
        this.searchService = searchService;
        this.kbAccess = kbAccess;
    }
    async searchArticles(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(401);
            return;
        }
        const q = typeof req.query['q'] === 'string' ? req.query['q'] : '';
        if (!q.trim()) {
            res.json({ hits: [] });
            return;
        }
        const limitRaw = typeof req.query['limit'] === 'string' ? parseInt(req.query['limit'], 10) : NaN;
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20;
        const statusesParam = typeof req.query['statuses'] === 'string' ? req.query['statuses'] : '';
        const statuses = statusesParam
            ? statusesParam.split(',').map((s) => s.trim()).filter(Boolean)
            : undefined;
        try {
            // Scope search results to the clients granted to this user; KB managers
            // search everything (null = unrestricted).
            const topicIds = await this.kbAccess.accessibleTopicIds(userId);
            if (topicIds !== null && topicIds.length === 0) {
                res.json({ hits: [] });
                return;
            }
            const hits = await this.searchService.search(q, {
                limit,
                statuses,
                ...(topicIds !== null && { topicIds }),
            });
            res.json({ hits });
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
        }
    }
    async createArticle(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        let { articleName, topicId, articleContent } = req.body;
        const article = await this.articleService.createArticle(articleName, articleContent, topicId, userId);
        return res.json(article);
    }
    async createVersion(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        const input = req.body;
        const article = await this.articleService.createVersion(input, userId);
        return res.json(article);
    }
    async updateArticleName(req, res) {
        const { articleId } = req.params;
        const { articleName } = req.body;
        if (!articleId || !articleName) {
            res.sendStatus(400);
            return;
        }
        try {
            await this.articleService.updateArticleName(articleId, articleName);
            res.sendStatus(200);
        }
        catch (error) {
            res.status(400).json({ error });
        }
    }
    async updateArticleSynopsis(req, res) {
        const { articleId } = req.params;
        const { articleSynopsis } = req.body;
        if (!articleId || !articleSynopsis) {
            res.sendStatus(400);
            return;
        }
        try {
            await this.articleService.updateArticleSynopsis(articleId, articleSynopsis);
            res.sendStatus(200);
        }
        catch (error) {
            res.status(400).json({ error });
        }
    }
    async generateAISynopsis(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        if (!articleId || !userId) {
            res.sendStatus(400);
            return;
        }
        try {
            const article = await this.articleService.generateAISynopsis(articleId);
            res.json(article);
        }
        catch (error) {
            res.status(400).json({ error });
        }
    }
    async updateArticleContent(req, res) {
        const { articleId } = req.params;
        const { articleContent } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        if (!articleId || articleContent === undefined) {
            res.sendStatus(400);
            return;
        }
        try {
            await this.articleService.updateArticleContent(articleId, articleContent, userId);
            res.sendStatus(200);
        }
        catch (error) {
            res.status(400).json({ error });
        }
    }
    async moveArticleToTopic(req, res) {
        const input = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        try {
            await this.articleService.moveArticleToTopic(input, userId);
            res.sendStatus(200);
        }
        catch (error) {
            res.status(400).json({ error });
        }
    }
    async startArticleEdit(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        if (!articleId || !userId) {
            res.sendStatus(400);
            return;
        }
        try {
            await this.articleService.startArticleEdit(userId, articleId);
            res.json({ success: true, message: 'Lock acquired.' });
        }
        catch (error) {
            if (error instanceof BusinessLogicError_1.BusinessLogicError) {
                return res.status(403).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async refreshArticleEditLock(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        if (!articleId || !userId) {
            res.sendStatus(400);
            return;
        }
        try {
            await this.articleService.refreshEditLock(userId, articleId);
            res.json({ success: true });
        }
        catch (error) {
            if (error instanceof BusinessLogicError_1.BusinessLogicError) {
                return res.status(403).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async publishVersion(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        if (!articleId || !userId) {
            res.sendStatus(400);
            return;
        }
        try {
            const article = await this.articleService.publishVersion(articleId);
            res.json(article);
        }
        catch (error) {
            if (error instanceof BusinessLogicError_1.BusinessLogicError) {
                return res.status(403).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async updateArticleAvailability(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        const { available } = req.body;
        if (!articleId || !userId || typeof available !== 'boolean') {
            res.sendStatus(400);
            return;
        }
        try {
            const result = await this.articleService.setArticleAvailability(articleId, available);
            res.json(result);
        }
        catch (error) {
            if (error instanceof BusinessLogicError_1.BusinessLogicError) {
                return res.status(403).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async updateArticleAiAvailability(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        const { available } = req.body;
        if (!articleId || !userId || typeof available !== 'boolean') {
            res.sendStatus(400);
            return;
        }
        try {
            const result = await this.articleService.setArticleAiAvailability(articleId, available);
            res.json(result);
        }
        catch (error) {
            if (error instanceof BusinessLogicError_1.BusinessLogicError) {
                return res.status(403).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async updateArticleProperty(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        const parsed = kb_domain_types_1.ArticlePropertyEnum.safeParse(req.body?.property);
        if (!articleId || !userId || !parsed.success) {
            res.sendStatus(400);
            return;
        }
        try {
            const result = await this.articleService.setArticleProperty(articleId, parsed.data);
            res.json(result);
        }
        catch (error) {
            if (error instanceof BusinessLogicError_1.BusinessLogicError) {
                return res.status(403).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async getArticleClientCopy(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        if (!articleId || !userId) {
            res.sendStatus(400);
            return;
        }
        try {
            const copy = await this.articleService.getArticleClientCopy(articleId, userId);
            res.json(copy);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async saveArticleClientCopy(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        if (!articleId || !userId) {
            res.sendStatus(400);
            return;
        }
        const { content, articleName, synopsis } = req.body;
        try {
            const copy = await this.articleService.saveClientCopy(articleId, { content, articleName, synopsis }, userId);
            res.json(copy);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async regenerateArticleClientCopy(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        if (!articleId || !userId) {
            res.sendStatus(400);
            return;
        }
        try {
            const copy = await this.articleService.regenerateClientCopy(articleId, userId);
            res.json(copy);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async unpublishVersion(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        if (!articleId || !userId) {
            res.sendStatus(400);
            return;
        }
        try {
            const article = await this.articleService.unpublishVersion(articleId);
            res.json(article);
        }
        catch (error) {
            if (error instanceof BusinessLogicError_1.BusinessLogicError) {
                return res.status(403).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async publishVersions(req, res) {
        const { articleIds } = req.body;
        const userId = req.user?.id;
        if (!articleIds || !userId) {
            res.sendStatus(400);
            return;
        }
        try {
            const article = await this.articleService.publishVersions(articleIds);
            res.json(article);
        }
        catch (error) {
            if (error instanceof BusinessLogicError_1.BusinessLogicError) {
                return res.status(403).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async unpublishVersions(req, res) {
        const { articleIds } = req.body;
        const userId = req.user?.id;
        if (!articleIds || !userId) {
            res.sendStatus(400);
            return;
        }
        try {
            await this.articleService.unpublishVersions(articleIds);
            res.sendStatus(200);
        }
        catch (error) {
            if (error instanceof BusinessLogicError_1.BusinessLogicError) {
                return res.status(403).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async closeArticleEdit(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        if (!articleId || !userId) {
            res.sendStatus(400);
            return;
        }
        try {
            await this.articleService.closeArticleEdit(userId, articleId);
            res.json({ success: true });
        }
        catch (error) {
            if (error instanceof BusinessLogicError_1.BusinessLogicError) {
                return res.status(403).json({ message: error.message });
            }
            res.status(400).json({ error });
        }
    }
    async addTagToArticle(req, res) {
        let { articleId } = req.params;
        let { tagName } = req.body;
        if (!articleId) {
            res.sendStatus(400);
            return;
        }
        if (!tagName) {
            res.sendStatus(400);
            return;
        }
        const tag = await this.articleService.addTagToArticle(articleId, tagName);
        return res.json(tag);
    }
    async removeTagFromArticle(req, res) {
        let { articleId, tagId } = req.params;
        if (!articleId || !tagId) {
            res.sendStatus(400);
            return;
        }
        await this.articleService.removeTagFromArticle(articleId, tagId);
        return res.sendStatus(200);
    }
    async getArticles(req, res) {
        const { topicId } = req.params;
        const userId = req.user?.id;
        if (!topicId || !userId) {
            res.sendStatus(400);
            return;
        }
        const articles = await this.articleService.getArticles(topicId, userId);
        return res.json(articles);
    }
    async getArticlesFiltered(req, res, next) {
        const validationResult = FilterArticleSchema_1.FilterArticleSchema.parse(req.query);
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        try {
            const result = await this.articleService.findArticles(validationResult, userId);
            res.status(200).json({
                data: result,
                pagination: {
                    totalItems: result.total,
                    currentPage: validationResult.page,
                    itemsPerPage: validationResult.limit,
                    totalPages: Math.ceil(result.total / validationResult.limit),
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            next(error);
        }
    }
    async getArticlesFilteredByClientId(req, res, next) {
        const validationResult = FilterArticleSchema_1.FilterArticleSchema.parse(req.query);
        const { clientId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        if (!clientId) {
            res.sendStatus(400);
            return;
        }
        try {
            const result = await this.articleService.findArticlesByClientId(clientId, validationResult, userId);
            res.status(200).json({
                data: result,
                pagination: {
                    totalItems: result.total,
                    currentPage: validationResult.page,
                    itemsPerPage: validationResult.limit,
                    totalPages: Math.ceil(result.total / validationResult.limit),
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            next(error);
        }
    }
    async getArticlesFilteredByTopicId(req, res, next) {
        const validationResult = FilterArticleSchema_1.FilterArticleSchema.parse(req.query);
        const { topicId } = req.params;
        if (!topicId) {
            res.sendStatus(400);
            return;
        }
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        try {
            const result = await this.articleService.findArticlesByTopicId(topicId, validationResult, userId);
            res.status(200).json({
                data: result,
                pagination: {
                    totalItems: result.total,
                    currentPage: validationResult.page,
                    itemsPerPage: validationResult.limit,
                    totalPages: Math.ceil(result.total / validationResult.limit),
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            next(error);
        }
    }
    async getLatestArticlesForUser(req, res, next) {
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        try {
            const articles = await this.articleService.findLatestArticlesByUserId(userId);
            return res.json(articles);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    async getArticleById(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        if (!articleId || !userId) {
            res.sendStatus(400);
            return;
        }
        const article = await this.articleService.getArticleWithDetails(articleId, userId);
        return res.json(article);
    }
    async getArticleDocumentById(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        if (!articleId || !userId) {
            res.sendStatus(400);
            return;
        }
        const article = await this.articleService.getArticleDocumentById(articleId, userId);
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(article);
    }
    async getArticleVersions(req, res) {
        const { articleId } = req.params;
        const userId = req.user?.id;
        if (!articleId || !userId) {
            res.sendStatus(400);
            return;
        }
        const article = await this.articleService.getArticleVersionsByArticleVersionId(articleId, userId);
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(article);
    }
    async getExternalClientArticles(req, res, next) {
        const { clientSharedId } = req.params;
        const validationResult = FilterArticleSchema_1.FilterArticleSchema.parse(req.query);
        const topicId = typeof req.query['topicId'] === 'string' ? req.query['topicId'] : undefined;
        if (!clientSharedId) {
            res.sendStatus(400);
            return;
        }
        try {
            // On the internal (staff JWT) route req.user is set and scopes the
            // request; API-key calls have no req.user (portal scopes those itself).
            const articles = await this.articleService.findSharedArticlesByClientSharedId(validationResult, clientSharedId, topicId, req.user?.id);
            return res.json(articles);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res
                    .status(error.statusCode || 400)
                    .json({ message: error.message });
            }
            next(error);
        }
    }
    /** Topics of a client for the portal sidebar tree (public, client API key). */
    async getExternalClientTopics(req, res, next) {
        const { clientSharedId } = req.params;
        if (!clientSharedId) {
            res.sendStatus(400);
            return;
        }
        try {
            const topics = await this.articleService.getTopicsBySharedClientId(clientSharedId);
            return res.json(topics);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res
                    .status(error.statusCode || 400)
                    .json({ message: error.message });
            }
            next(error);
        }
    }
    async getArticleLockInfo(req, res) {
        const { articleId } = req.params;
        if (!articleId) {
            res.sendStatus(400);
            return;
        }
        const article = await this.articleService.getArticleLockInfo(articleId);
        return res.json(article);
    }
    async getExternalClientArticleDetails(req, res, next) {
        const { clientSharedId } = req.params;
        const { articleId } = req.params;
        if (!clientSharedId || !articleId) {
            res.sendStatus(400);
            return;
        }
        try {
            const articles = await this.articleService.getArticleByExternalClientAndArticleId(clientSharedId, articleId);
            return res.json(articles);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode || 400).json({ message: error.message });
            }
            next(error);
        }
    }
    // ─── Admin variants (no `available_for_client` filter) ───────────────────────
    async getAdminClientArticles(req, res, next) {
        const { clientSharedId } = req.params;
        const validationResult = FilterArticleSchema_1.FilterArticleSchema.parse(req.query);
        const topicId = typeof req.query['topicId'] === 'string' ? req.query['topicId'] : undefined;
        if (!clientSharedId) {
            res.sendStatus(400);
            return;
        }
        try {
            const articles = await this.articleService.findAllPublishedByClientSharedId(validationResult, clientSharedId, topicId);
            return res.json(articles);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res
                    .status(error.statusCode || 400)
                    .json({ message: error.message });
            }
            next(error);
        }
    }
    /** Topics of a client for the portal sidebar tree (admin variant). */
    async getAdminClientTopics(req, res, next) {
        const { clientSharedId } = req.params;
        if (!clientSharedId) {
            res.sendStatus(400);
            return;
        }
        try {
            const topics = await this.articleService.getTopicsBySharedClientId(clientSharedId);
            return res.json(topics);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res
                    .status(error.statusCode || 400)
                    .json({ message: error.message });
            }
            next(error);
        }
    }
    async getAdminClientArticleDetails(req, res, next) {
        const { clientSharedId } = req.params;
        const { articleId } = req.params;
        if (!clientSharedId || !articleId) {
            res.sendStatus(400);
            return;
        }
        try {
            const article = await this.articleService.getArticleByExternalClientAndArticleIdAdmin(clientSharedId, articleId);
            return res.json(article);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res
                    .status(error.statusCode || 400)
                    .json({ message: error.message });
            }
            next(error);
        }
    }
    /** Maintenance: backfill chunk embeddings for every published version (or
     *  a specific client's). Use when the search index is incomplete because
     *  articles pre-date the chunker. Long-running: count + log when done. */
    async reindexAllPublishedChunks(req, res, next) {
        const clientSharedId = typeof req.query['clientSharedId'] === 'string'
            ? req.query['clientSharedId']
            : undefined;
        try {
            const result = await this.articleService.reindexAllPublishedChunks(clientSharedId);
            return res.json({ ok: true, ...result });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res
                    .status(error.statusCode || 400)
                    .json({ message: error.message });
            }
            next(error);
        }
    }
};
exports.ArticleController = ArticleController;
exports.ArticleController = ArticleController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleService)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleSearchService)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IKbAccessService)),
    __metadata("design:paramtypes", [Object, articleSearch_service_1.ArticleSearchService,
        kbAccess_service_1.KbAccessService])
], ArticleController);
//# sourceMappingURL=articles.controller.js.map