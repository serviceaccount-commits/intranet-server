"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleService = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const ArticleVersion_entity_1 = require("../entities/ArticleVersion.entity");
const Tag_entity_1 = require("../entities/Tag.entity");
const ValidationError_1 = require("../../../../shared/errors/ValidationError");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const ai_service_1 = require("../../../../shared/utils/ai.service");
const pgvector_1 = __importDefault(require("pgvector"));
const ArticleChunk_entity_1 = require("../entities/ArticleChunk.entity");
const cheerio = __importStar(require("cheerio"));
const MoveArticleSchema_1 = require("../schema/clients/MoveArticleSchema");
const Article_entity_1 = require("../entities/Article.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const CreateVersionSchema_1 = require("../schema/articles/CreateVersionSchema");
let ArticleService = class ArticleService {
    articleRepository;
    topicRepository;
    clientRepository;
    userRepository;
    documentService;
    tagRepository;
    constructor(articleRepository, topicRepository, clientRepository, userRepository, documentService, tagRepository) {
        this.articleRepository = articleRepository;
        this.topicRepository = topicRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.documentService = documentService;
        this.tagRepository = tagRepository;
    }
    async createArticle(articleName, articleContent, topicId, userId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new Error(`User with id ${userId} does not exist.`);
            }
            const exisitingTopic = await this.topicRepository.findById(topicId);
            if (!exisitingTopic) {
                throw new Error(`Topic with id ${topicId} does not exist.`);
            }
            const articleDocument = await this.documentService.createArticleDocument(articleContent);
            const newArticle = new Article_entity_1.Article();
            newArticle.topic = exisitingTopic;
            newArticle.topic_id = topicId;
            newArticle.user = user;
            newArticle.user_id = userId;
            const article = await data_source_1.AppDataSource.manager.save(newArticle);
            const newArticleFirstVersion = new ArticleVersion_entity_1.ArticleVersion();
            newArticleFirstVersion.article_name = articleName;
            newArticleFirstVersion.document = articleDocument;
            newArticleFirstVersion.user = user;
            newArticleFirstVersion.user_id = userId;
            newArticleFirstVersion.user_update = user;
            newArticleFirstVersion.user_update_id = userId;
            newArticleFirstVersion.version = 1;
            newArticleFirstVersion.article = article;
            return await this.articleRepository.create(newArticleFirstVersion);
        });
    }
    async createVersion(input, userId) {
        const validatedData = CreateVersionSchema_1.CreateVersionSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new NotFoundError_1.NotFoundError(`User`, userId);
            }
            const version = await this.articleRepository.findById(input.versionId);
            if (!version) {
                throw new NotFoundError_1.NotFoundError('Version', input.versionId);
            }
            const latestVersion = await this.articleRepository.findLatestVersion(version.article_id);
            if (!latestVersion) {
                throw new BusinessLogicError_1.BusinessLogicError('No latest version found');
            }
            if (validatedData.useVersionAsTemplate) {
                const document = await this.documentService.getDocumentFromS3(version.document.document_id, 'articles');
                const newVersion = new ArticleVersion_entity_1.ArticleVersion();
                newVersion.article_name = version.article_name;
                newVersion.article_synopsis = version.article_synopsis;
                newVersion.article_status = ES_1.default.DRAFT;
                newVersion.article = version.article;
                newVersion.article_id = version.article_id;
                const versionDocument = await this.documentService.createArticleDocument(document);
                newVersion.document = versionDocument;
                newVersion.user = version.user;
                newVersion.user_id = version.user_id;
                newVersion.user_update = user;
                newVersion.user_update_id = user.user_id;
                newVersion.version = latestVersion.version + 1;
                newVersion.tags = version.tags;
                return await this.articleRepository.create(newVersion);
            }
            else {
                const versionDocument = await this.documentService.createArticleDocument('');
                const newVersion = new ArticleVersion_entity_1.ArticleVersion();
                newVersion.article_name = '';
                newVersion.article_synopsis = '';
                newVersion.article_status = ES_1.default.DRAFT;
                newVersion.article = version.article;
                newVersion.article_id = version.article_id;
                newVersion.document = versionDocument;
                newVersion.user = version.user;
                newVersion.user_id = version.user_id;
                newVersion.version = latestVersion.version + 1;
                return await this.articleRepository.create(newVersion);
            }
        });
    }
    async addTagToArticle(articleId, tagName) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const article = await this.articleRepository.findById(articleId);
            if (!article) {
                throw new Error(`Article with id ${articleId} does not exist.`);
            }
            let tag = await this.tagRepository.findByName(tagName);
            if (!tag) {
                const newTag = new Tag_entity_1.Tag();
                newTag.tag_name = tagName;
                tag = await this.tagRepository.create(newTag);
            }
            article.tags = [...(article.tags || []), tag];
            await this.articleRepository.save(article);
            return tag;
        });
    }
    async removeTagFromArticle(articleId, tagId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const article = await this.articleRepository.findById(articleId);
            if (!article) {
                throw new Error(`Article with id ${articleId} does not exist.`);
            }
            if (!article.tags) {
                return;
            }
            article.tags = article.tags.filter((tag) => tag.tag_id !== tagId);
            await this.articleRepository.save(article);
        });
    }
    async getArticles(topicId) {
        return await this.articleRepository.findAllByTopicId(topicId);
    }
    async findArticles(filters, userId) {
        let embeddingSql = null;
        if (filters.search) {
            const queryEmbedding = await (0, ai_service_1.getEmbedding)(filters.search);
            embeddingSql = pgvector_1.default.toSql(queryEmbedding);
        }
        const user = await this.userRepository.findUserByIdWithPermissions(userId);
        const canSeeDraft = user?.role.permissions.findIndex((p) => p.permission_id === 'kb:article:view:metadata') !== -1;
        return await this.articleRepository.findAndCountArticles(filters, embeddingSql, canSeeDraft);
    }
    async findLatestArticlesByUserId(userId) {
        const user = await this.userRepository.findUserById(userId);
        if (!user?.clients || user.clients.length === 0) {
            return [];
        }
        const clientIds = user.clients.map((c) => c.client_id);
        console.log('CLIENT IDS: ');
        console.log(clientIds);
        if (clientIds.length === 0) {
            return [];
        }
        return await this.articleRepository.findAllLatestByUserId(clientIds);
    }
    async findArticlesByClientId(clientId, filters, userId) {
        let embeddingSql = null;
        if (filters.search) {
            const queryEmbedding = await (0, ai_service_1.getEmbedding)(filters.search);
            embeddingSql = pgvector_1.default.toSql(queryEmbedding);
        }
        const user = await this.userRepository.findUserByIdWithPermissions(userId);
        const canSeeDraft = user?.role.permissions.findIndex((p) => p.permission_id === 'kb:article:view:metadata') !== -1;
        const res = await this.articleRepository.findAndCountArticlesByClientId(clientId, filters, embeddingSql, canSeeDraft);
        console.log('RES: ');
        console.log(res);
        return res;
    }
    async findArticlesByTopicId(topicId, filters, userId) {
        let embeddingSql = null;
        if (filters.search) {
            const queryEmbedding = await (0, ai_service_1.getEmbedding)(filters.search);
            embeddingSql = pgvector_1.default.toSql(queryEmbedding);
        }
        const user = await this.userRepository.findUserByIdWithPermissions(userId);
        const canSeeDraft = user?.role.permissions.findIndex((p) => p.permission_id === 'kb:article:view:metadata') !== -1;
        return await this.articleRepository.findAndCountArticlesByTopicId(topicId, filters, embeddingSql, canSeeDraft);
    }
    async getArticleById(articleId) {
        const article = await this.articleRepository.findById(articleId);
        if (!article) {
            throw new NotFoundError_1.NotFoundError('Article', articleId);
        }
        // const document = await this.documentService.getLocalDocument(
        //   article.document.document_id,
        //   'articles',
        // );
        const document = await this.documentService.getDocumentFromS3(article.document.document_id, 'articles');
        return {
            article,
            document,
            available_for_client: article.article.available_for_client,
        };
    }
    async getArticleDocumentById(articleId) {
        const article = await this.articleRepository.findById(articleId);
        if (!article) {
            throw new NotFoundError_1.NotFoundError('Article', articleId);
        }
        // return await this.documentService.getLocalDocument(
        //   article.document.document_id,
        //   'articles',
        // );
        return await this.documentService.getDocumentFromS3(article.document.document_id, 'articles');
    }
    async updateArticleContent(articleId, articleContent, userId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const article = await this.articleRepository.findById(articleId);
            if (!article) {
                throw new NotFoundError_1.NotFoundError('Article', articleId);
            }
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new NotFoundError_1.NotFoundError('User', userId);
            }
            // await this.documentService.updateLocalDocument(
            //   article.document.document_id,
            //   'articles',
            //   articleContent,
            // );
            await this.documentService.uploadDocumentToS3(article.document.document_id, 'articles', articleContent);
            article.user_update = user;
            article.user_update_id = userId;
            await this.articleRepository.save(article);
            await this.updateArticleChunks(article, articleContent);
        });
    }
    async updateArticleChunks(article, htmlContent) {
        const chunkRepository = data_source_1.AppDataSource.getRepository(ArticleChunk_entity_1.ArticleChunk);
        await chunkRepository.delete({
            articleVersion: { article_version_id: article.article_id },
        });
        const $ = cheerio.load(htmlContent);
        $('br').replaceWith(' ');
        $('p, li, h1, h2, h3, div, th, td, blockquote').after('\n\n');
        const fullText = $('body').text();
        const chunks = fullText
            .split('\n\n')
            .map((chunk) => chunk.replace(/\s+/g, ' ').trim());
        for (const chunkText of chunks) {
            if (chunkText.length <= 1) {
                continue;
            }
            const embeddingVector = await (0, ai_service_1.getEmbedding)(chunkText);
            const newChunk = chunkRepository.create({
                article_version_id: article.article_id,
                articleVersion: article,
                content: chunkText,
                embedding: pgvector_1.default.toSql(embeddingVector),
            });
            await chunkRepository.save(newChunk);
        }
    }
    async updateArticleName(articleId, articleName) {
        if (articleName.length <= 1) {
            throw new ValidationError_1.ValidationError('Article name needs to be at least 2 characters');
        }
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const article = await this.articleRepository.findById(articleId);
            if (!article) {
                throw new NotFoundError_1.NotFoundError('Article', articleId);
            }
            article.article_name = articleName;
            await this.articleRepository.save(article);
        });
    }
    async updateArticleSynopsis(articleId, articleSynopsis) {
        if (articleSynopsis.length <= 1) {
            throw new ValidationError_1.ValidationError('Synopsis too short');
        }
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const article = await this.articleRepository.findById(articleId);
            if (!article) {
                throw new NotFoundError_1.NotFoundError('Article', articleId);
            }
            article.article_synopsis = articleSynopsis;
            await this.articleRepository.save(article);
        });
    }
    async generateAISynopsis(articleVersionId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const articleVersion = await this.articleRepository.findById(articleVersionId);
            if (!articleVersion) {
                console.log('Article Version not found', articleVersionId);
                throw new NotFoundError_1.NotFoundError('Article Version', articleVersionId);
            }
            const document = await this.documentService.getDocumentFromS3(articleVersion.document_id, 'articles');
            const $ = cheerio.load(document);
            $('br').replaceWith(' ');
            $('p, li, h1, h2, h3, div, th, td, blockquote').after('\n\n');
            const fullText = $('body').text();
            const articleContent = fullText;
            const articleSynopsis = await (0, ai_service_1.generateArticleSynopsis)(articleContent);
            articleVersion.article_synopsis = articleSynopsis;
            await this.articleRepository.save(articleVersion);
            return articleSynopsis;
        });
    }
    async startArticleEdit(userId, articleId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const article = await this.articleRepository.findById(articleId);
            if (!article) {
                throw new NotFoundError_1.NotFoundError('Article', articleId);
            }
            const now = new Date();
            const parentArticle = article.article;
            if (!parentArticle) {
                throw new NotFoundError_1.NotFoundError('Article', articleId);
            }
            if (!parentArticle.lock_expires_at ||
                parentArticle.lock_expires_at < now) {
                parentArticle.locked_by_user_id = userId;
                parentArticle.lock_expires_at = new Date(now.getTime() + 60 * 1000);
                await this.articleRepository.saveArticle(parentArticle);
                return;
            }
            else {
                throw new BusinessLogicError_1.BusinessLogicError('Article is currently being edited by another user.');
            }
        });
    }
    async refreshEditLock(_userId, articleId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const article = await this.articleRepository.findByIdAndLockedById(articleId);
            if (!article) {
                throw new NotFoundError_1.NotFoundError('Article', articleId);
            }
            const parentArticle = article.article;
            if (!parentArticle) {
                throw new NotFoundError_1.NotFoundError('Article', articleId);
            }
            parentArticle.lock_expires_at = new Date(new Date().getTime() + 60 * 1000);
            await this.articleRepository.saveArticle(parentArticle);
        });
    }
    async closeArticleEdit(_userId, articleId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const article = await this.articleRepository.findByIdAndLockedById(articleId);
            if (!article) {
                throw new BusinessLogicError_1.BusinessLogicError('Article is not locked by this user');
            }
            const parentArticle = article.article;
            if (!parentArticle) {
                throw new NotFoundError_1.NotFoundError('Article', articleId);
            }
            parentArticle.locked_by_user_id = null;
            parentArticle.lock_expires_at = null;
            await this.articleRepository.saveArticle(parentArticle);
        });
    }
    async releaseAllArticleLocks() {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const articles = await this.articleRepository.findAllArticleLocked();
            if (!articles || articles.length === 0) {
                return;
            }
            const articlesToSave = [];
            for (const article of articles) {
                article.locked_by_user_id = null;
                article.lock_expires_at = null;
                articlesToSave.push(article);
            }
            await this.articleRepository.saveManyArticle(articlesToSave);
        });
    }
    async getArticleLockInfo(articleId) {
        const article = await this.articleRepository.findByIdAndLockedById(articleId);
        if (!article) {
            throw new NotFoundError_1.NotFoundError('Article', articleId);
        }
        const parentArticle = article.article;
        if (!parentArticle) {
            throw new NotFoundError_1.NotFoundError('Article', articleId);
        }
        const isAvailable = parentArticle.locked_by_user_id === null;
        return isAvailable;
    }
    async moveArticleToTopic(input, userId) {
        const validatedData = MoveArticleSchema_1.MoveArticleSchema.parse(input);
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            // TODO: CHECK USER PERMISSIONS
            console.log(userId);
            const articles = await this.articleRepository.findByIds(validatedData.articleIds);
            if (articles.length === 0) {
                throw new BusinessLogicError_1.BusinessLogicError('Articles to move cannot be empty');
            }
            const topic = await this.topicRepository.findById(input.topicId);
            if (!topic) {
                throw new NotFoundError_1.NotFoundError('Topic', input.topicId);
            }
            const articlesToSave = [];
            for (const article of articles) {
                article.article.topic = topic;
                article.article.topic_id = topic.topic_id;
                articlesToSave.push(article.article);
            }
            await this.articleRepository.saveManyArticle(articlesToSave);
        });
    }
    async getArticleVersionsByArticleVersionId(articleVersionId) {
        const versions = await this.articleRepository.findVersionsByVersionId(articleVersionId);
        if (versions.length === 0) {
            throw new BusinessLogicError_1.BusinessLogicError('No versions found');
        }
        return versions;
    }
    async publishVersions(articleIds) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const versions = await this.articleRepository.findByIds(articleIds);
            if (versions.length === 0) {
                throw new BusinessLogicError_1.BusinessLogicError('No versions found');
            }
            for (const version of versions) {
                if (version.article_status !== ES_1.default.UNPUBLISHED) {
                    throw new BusinessLogicError_1.BusinessLogicError('Article is not in draft status');
                }
                version.article_status = ES_1.default.PUBLISHED;
                version.published_at = new Date();
                await this.articleRepository.save(version);
            }
        });
    }
    async unpublishVersions(articleIds) {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            console.log('articleIds');
            console.log(articleIds);
            const versions = await this.articleRepository.findByIds(articleIds);
            console.log('versions');
            console.log(versions);
            if (versions.length === 0) {
                console.log('No versions found');
                throw new BusinessLogicError_1.BusinessLogicError('No versions found');
            }
            for (const version of versions) {
                if (version.article_status !== ES_1.default.PUBLISHED) {
                    console.log('Article is not published');
                    throw new BusinessLogicError_1.BusinessLogicError('Article is not published');
                }
                version.article_status = ES_1.default.UNPUBLISHED;
                await this.articleRepository.save(version);
            }
        });
    }
    async publishVersion(articleVersionId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const version = await this.articleRepository.findById(articleVersionId);
            if (!version) {
                throw new NotFoundError_1.NotFoundError('Article version', articleVersionId);
            }
            if (version.article_status !== ES_1.default.DRAFT &&
                version.article_status !== ES_1.default.UNPUBLISHED) {
                throw new BusinessLogicError_1.BusinessLogicError('Article is not in draft or unpublished status');
            }
            version.article_status = ES_1.default.PUBLISHED;
            if (version.article_status === ES_1.default.DRAFT) {
                const previousVersion = await this.articleRepository.findVersionByArticleIdAndVersionNumber(version.article_id, version.version - 1);
                if (previousVersion) {
                    previousVersion.article_status = ES_1.default.OUTDATED;
                    await this.articleRepository.save(previousVersion);
                }
            }
            return this.articleRepository.save(version);
        });
    }
    async unpublishVersion(articleVersionId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const version = await this.articleRepository.findById(articleVersionId);
            if (!version) {
                throw new NotFoundError_1.NotFoundError('Article version', articleVersionId);
            }
            if (version.article_status !== ES_1.default.PUBLISHED) {
                throw new BusinessLogicError_1.BusinessLogicError('Article is not in published status');
            }
            version.article_status = ES_1.default.UNPUBLISHED;
            return this.articleRepository.save(version);
        });
    }
    async findSharedArticlesByClientSharedId(filters, clientSharedId) {
        const client = await this.clientRepository.findBySharedId(clientSharedId);
        if (!client) {
            throw new NotFoundError_1.NotFoundError('Client', clientSharedId);
        }
        let embeddingSql = null;
        if (filters.search) {
            const queryEmbedding = await (0, ai_service_1.getEmbedding)(filters.search);
            embeddingSql = pgvector_1.default.toSql(queryEmbedding);
        }
        const rawArticles = await this.articleRepository.findSharedArticlesByClientSharedId(clientSharedId, embeddingSql);
        const articles = rawArticles.map((article) => {
            return {
                article_id: article.article_id,
                article_name: article.article_name,
                article_synopsis: article.article_synopsis,
                updated_at: article.updatedAt,
            };
        });
        return articles;
    }
    async getArticleByExternalClientAndArticleId(clientSharedId, articleId) {
        const article = await this.articleRepository.getArticleByExternalClientAndArticleId(clientSharedId, articleId);
        if (!article) {
            throw new NotFoundError_1.NotFoundError('Article', articleId);
        }
        const document = await this.documentService.getDocumentFromS3(article.document.document_id, 'articles');
        return {
            article: {
                article_id: article.article_id,
                article_name: article.article_name,
                article_synopsis: article.article_synopsis,
                updated_at: article.updatedAt,
            },
            document,
        };
    }
};
exports.ArticleService = ArticleService;
exports.ArticleService = ArticleService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.ITopicRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IClientRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __param(4, (0, inversify_1.inject)(containerTypes_1.TYPES.IDocumentService)),
    __param(5, (0, inversify_1.inject)(containerTypes_1.TYPES.ITagRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ArticleService);
//# sourceMappingURL=article.service.js.map