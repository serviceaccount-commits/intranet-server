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
exports.ArticleExternalService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
let ArticleExternalService = class ArticleExternalService {
    articleRepository;
    topicRepository;
    clientRepository;
    constructor(articleRepository, topicRepository, clientRepository) {
        this.articleRepository = articleRepository;
        this.topicRepository = topicRepository;
        this.clientRepository = clientRepository;
    }
    async resolveTopicIdsForSharedClient(clientSharedId) {
        const client = await this.clientRepository.findBySharedId(clientSharedId);
        if (!client)
            return [];
        const topics = await this.topicRepository.findAllByClientId(client.client_id);
        return topics.map((t) => t.topic_id);
    }
    async findSharedArticlesByClientSharedId(filters, clientSharedId) {
        const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
        if (topicIds.length === 0)
            return [];
        const views = await this.articleRepository.findPublishedByTopicIds(topicIds, filters);
        return views.map((v) => ({
            article_id: v.article_version_id,
            article_name: v.article_name,
            article_synopsis: v.article_synopsis,
            updated_at: v.updatedAt,
        }));
    }
    async getArticleByExternalClientAndArticleId(clientSharedId, versionId) {
        const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
        if (topicIds.length === 0)
            throw new NotFoundError_1.NotFoundError('Client', clientSharedId);
        const view = await this.articleRepository.findPublishedVersionByTopicIds(topicIds, versionId);
        if (!view)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        return {
            article: {
                article_id: view.article_version_id,
                article_name: view.article_name,
                article_synopsis: view.article_synopsis,
                updated_at: view.updatedAt,
            },
            content: view.content,
        };
    }
    // ─── Admin variants (ignore `available_for_client` flag) ─────────────────────
    async findAllPublishedByClientSharedId(filters, clientSharedId) {
        const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
        if (topicIds.length === 0)
            return [];
        const views = await this.articleRepository.findPublishedByTopicIds(topicIds, filters, true);
        return views.map((v) => ({
            article_id: v.article_version_id,
            article_name: v.article_name,
            article_synopsis: v.article_synopsis,
            updated_at: v.updatedAt,
        }));
    }
    async getArticleByExternalClientAndArticleIdAdmin(clientSharedId, versionId) {
        const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
        if (topicIds.length === 0)
            throw new NotFoundError_1.NotFoundError('Client', clientSharedId);
        const view = await this.articleRepository.findPublishedVersionByTopicIds(topicIds, versionId, true);
        if (!view)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        return {
            article: {
                article_id: view.article_version_id,
                article_name: view.article_name,
                article_synopsis: view.article_synopsis,
                updated_at: view.updatedAt,
            },
            content: view.content,
        };
    }
};
exports.ArticleExternalService = ArticleExternalService;
exports.ArticleExternalService = ArticleExternalService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.ITopicRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IClientRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ArticleExternalService);
//# sourceMappingURL=article-external.service.js.map