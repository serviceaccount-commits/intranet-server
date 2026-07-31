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
var ArticleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleService = void 0;
const inversify_1 = require("inversify");
const cheerio = __importStar(require("cheerio"));
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const ValidationError_1 = require("../../../../shared/errors/ValidationError");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const MoveArticleSchema_1 = require("../schema/clients/MoveArticleSchema");
const ManagedArticleSchemas_1 = require("../schema/manage/ManagedArticleSchemas");
const CreateVersionSchema_1 = require("../schema/articles/CreateVersionSchema");
const ai_service_1 = require("../../../../shared/utils/ai.service");
const kb_constants_1 = require("../kb.constants");
const articleChunking_service_1 = require("./articleChunking.service");
const articleSearch_service_1 = require("./articleSearch.service");
const KB_PERM_VIEW_METADATA = 'kb:article:view:metadata';
let ArticleService = class ArticleService {
    static { ArticleService_1 = this; }
    articleRepository;
    topicRepository;
    clientRepository;
    userRepository;
    tagRepository;
    chunkingService;
    searchService;
    constructor(articleRepository, topicRepository, clientRepository, userRepository, tagRepository, chunkingService, searchService) {
        this.articleRepository = articleRepository;
        this.topicRepository = topicRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
        this.chunkingService = chunkingService;
        this.searchService = searchService;
    }
    // ─── Helpers ──────────────────────────────────────────────────────────────────
    async getCanSeeDraft(userId) {
        const user = await this.userRepository.findUserByIdWithPermissions(userId);
        return (user?.role.permissions.findIndex((p) => p.permission_id === KB_PERM_VIEW_METADATA) !== -1);
    }
    // ─── Create ───────────────────────────────────────────────────────────────────
    async createArticle(articleName, content, topicId, userId) {
        const user = await this.userRepository.findUserById(userId);
        if (!user)
            throw new NotFoundError_1.NotFoundError('User', userId);
        const topic = await this.topicRepository.findById(topicId);
        if (!topic)
            throw new NotFoundError_1.NotFoundError('Topic', topicId);
        const updatedByName = `${user.first_name} ${user.last_name}`;
        const created = await this.articleRepository.createArticle(topicId, userId, articleName, content, updatedByName);
        if (content && content.trim()) {
            await this.chunkingService.processVersionSafe(created.article_id, created.article_version_id, content, 'internal');
            // The client copy was seeded with the same content on create; chunk it
            // too (audience 'client') so it is searchable once made available.
            const copy = await this.articleRepository.getClientCopyByArticleId(created.article_id);
            if (copy) {
                await this.chunkingService.processVersionSafe(copy.article_id, copy.client_copy_id, content, 'client');
            }
        }
        return created;
    }
    // ─── Client copy (dual view) ───────────────────────────────────────────────────
    async getArticleClientCopy(versionId) {
        const version = await this.articleRepository.findByVersionId(versionId);
        if (!version)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        const copy = await this.articleRepository.getClientCopyByArticleId(version.article_id);
        if (!copy)
            throw new NotFoundError_1.NotFoundError('Client copy', versionId);
        return copy;
    }
    async saveClientCopy(versionId, input, userId) {
        const version = await this.articleRepository.findByVersionId(versionId);
        if (!version)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        const user = await this.userRepository.findUserById(userId);
        const updatedByName = user ? `${user.first_name} ${user.last_name}` : null;
        const updated = await this.articleRepository.updateClientCopy(version.article_id, { content: input.content, name: input.articleName, synopsis: input.synopsis }, userId, updatedByName);
        if (!updated)
            throw new NotFoundError_1.NotFoundError('Client copy', versionId);
        // Re-chunk the client corpus only when the content changed.
        if (input.content !== undefined) {
            await this.chunkingService.processVersionSafe(updated.article_id, updated.client_copy_id, input.content, 'client');
        }
        return updated;
    }
    async regenerateClientCopy(versionId, userId) {
        const version = await this.articleRepository.findByVersionId(versionId);
        if (!version)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        const user = await this.userRepository.findUserById(userId);
        const updatedByName = user ? `${user.first_name} ${user.last_name}` : null;
        const regenerated = await this.articleRepository.regenerateClientCopyFromVersion(version.article_id, versionId, userId, updatedByName);
        if (!regenerated)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        await this.chunkingService.processVersionSafe(regenerated.article_id, regenerated.client_copy_id, regenerated.content, 'client');
        return regenerated;
    }
    async createVersion(input, userId) {
        const data = CreateVersionSchema_1.CreateVersionSchema.parse(input);
        const user = await this.userRepository.findUserById(userId);
        if (!user)
            throw new NotFoundError_1.NotFoundError('User', userId);
        const existing = await this.articleRepository.findByVersionId(data.versionId);
        if (!existing)
            throw new NotFoundError_1.NotFoundError('Version', data.versionId);
        const newVersion = await this.articleRepository.addVersion(data.versionId, {
            useVersionAsTemplate: data.useVersionAsTemplate,
            userId,
            updatedByName: `${user.first_name} ${user.last_name}`,
        });
        if (data.useVersionAsTemplate && newVersion.content && newVersion.content.trim()) {
            await this.chunkingService.processVersionSafe(newVersion.article_id, newVersion.article_version_id, newVersion.content);
        }
        return newVersion;
    }
    // ─── Content updates ──────────────────────────────────────────────────────────
    async updateArticleContent(versionId, content, userId) {
        const [existing, user] = await Promise.all([
            this.articleRepository.findByVersionId(versionId),
            this.userRepository.findUserById(userId),
        ]);
        if (!existing)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        const updatedByName = user ? `${user.first_name} ${user.last_name}` : null;
        await this.articleRepository.updateVersionContent(versionId, content, userId, updatedByName);
        await this.chunkingService.processVersionSafe(existing.article_id, versionId, content);
    }
    async updateArticleName(versionId, articleName) {
        if (articleName.length < 2) {
            throw new ValidationError_1.ValidationError('Article name must be at least 2 characters.');
        }
        const existing = await this.articleRepository.findByVersionId(versionId);
        if (!existing)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        await this.articleRepository.updateVersionName(versionId, articleName);
    }
    async updateArticleSynopsis(versionId, synopsis) {
        if (synopsis.length < 2) {
            throw new ValidationError_1.ValidationError('Synopsis must be at least 2 characters.');
        }
        const existing = await this.articleRepository.findByVersionId(versionId);
        if (!existing)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        await this.articleRepository.updateVersionSynopsis(versionId, synopsis);
    }
    async generateAISynopsis(versionId) {
        const article = await this.articleRepository.findByVersionId(versionId);
        if (!article)
            throw new NotFoundError_1.NotFoundError('Article Version', versionId);
        const $ = cheerio.load(article.content);
        $('br').replaceWith(' ');
        $('p, li, h1, h2, h3, div, th, td, blockquote').after('\n\n');
        const plainText = $('body').text().trim();
        const synopsis = await (0, ai_service_1.generateArticleSynopsis)(plainText);
        await this.articleRepository.updateVersionSynopsis(versionId, synopsis);
        return synopsis;
    }
    // ─── Edit lock ────────────────────────────────────────────────────────────────
    async startArticleEdit(userId, versionId) {
        const lockInfo = await this.articleRepository.getLockInfo(versionId);
        if (!lockInfo)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        const now = new Date();
        if (lockInfo.locked_by_user_id && lockInfo.lock_expires_at && lockInfo.lock_expires_at > now) {
            throw new BusinessLogicError_1.BusinessLogicError('Article is currently being edited by another user.');
        }
        const expiresAt = new Date(now.getTime() + kb_constants_1.ARTICLE_LOCK_DURATION_MS);
        await this.articleRepository.acquireLock(versionId, userId, expiresAt);
    }
    async refreshEditLock(userId, versionId) {
        const lockInfo = await this.articleRepository.getLockInfo(versionId);
        if (!lockInfo)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        if (lockInfo.locked_by_user_id && lockInfo.locked_by_user_id !== userId) {
            throw new BusinessLogicError_1.BusinessLogicError('You do not own this lock.');
        }
        const expiresAt = new Date(Date.now() + kb_constants_1.ARTICLE_LOCK_DURATION_MS);
        await this.articleRepository.refreshLock(versionId, expiresAt);
    }
    async closeArticleEdit(userId, versionId) {
        const lockInfo = await this.articleRepository.getLockInfo(versionId);
        if (!lockInfo)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        if (lockInfo.locked_by_user_id && lockInfo.locked_by_user_id !== userId) {
            throw new BusinessLogicError_1.BusinessLogicError('You do not own this lock.');
        }
        await this.articleRepository.releaseLock(versionId);
    }
    async releaseAllArticleLocks() {
        await this.articleRepository.releaseAllLocks();
    }
    async getArticleLockInfo(versionId) {
        const lockInfo = await this.articleRepository.getLockInfo(versionId);
        if (!lockInfo)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        return lockInfo;
    }
    // ─── Tags ─────────────────────────────────────────────────────────────────────
    async addTagToArticle(versionId, tagName) {
        const existing = await this.articleRepository.findByVersionId(versionId);
        if (!existing)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        let tag = await this.tagRepository.findByName(tagName);
        if (!tag) {
            tag = await this.tagRepository.create({ tag_name: tagName });
        }
        await this.articleRepository.addTagToVersion(versionId, tag._id.toString());
        return tag;
    }
    async removeTagFromArticle(versionId, tagId) {
        const existing = await this.articleRepository.findByVersionId(versionId);
        if (!existing)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        await this.articleRepository.removeTagFromVersion(versionId, tagId);
    }
    // ─── Queries ──────────────────────────────────────────────────────────────────
    async getArticles(topicId) {
        return this.articleRepository.findAllLatestByTopicId(topicId);
    }
    async findLatestArticlesByUserId(userId) {
        const clients = await this.clientRepository.findAllWithUserId(userId);
        if (clients.length === 0)
            return [];
        const clientIds = clients.map((c) => c.client_id);
        const topics = await this.topicRepository.findAllByClientIds(clientIds);
        if (topics.length === 0)
            return [];
        const topicIds = topics.map((t) => t.topic_id);
        return this.articleRepository.findRecentByTopicIds(topicIds, 10);
    }
    async findArticles(filters, userId) {
        const canSeeDraft = await this.getCanSeeDraft(userId);
        return this.articleRepository.findAndCount(filters, canSeeDraft);
    }
    async findArticlesByClientId(clientId, filters, userId) {
        const canSeeDraft = await this.getCanSeeDraft(userId);
        const topics = await this.topicRepository.findAllByClientId(clientId);
        if (topics.length === 0)
            return { articles: [], total: 0 };
        const topicIds = topics.map((t) => t.topic_id);
        return this.articleRepository.findAndCountByTopicIds(topicIds, filters, canSeeDraft);
    }
    async findArticlesByTopicId(topicId, filters, userId) {
        const canSeeDraft = await this.getCanSeeDraft(userId);
        return this.articleRepository.findAndCountByTopicId(topicId, filters, canSeeDraft);
    }
    async getArticleById(versionId) {
        const article = await this.articleRepository.findByVersionId(versionId);
        if (!article)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        return article;
    }
    async getArticleWithDetails(versionId) {
        const view = await this.articleRepository.findByVersionId(versionId);
        if (!view)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        const [tags, topic, creator, updater, publisher] = await Promise.all([
            this.tagRepository.findByIds(view.tag_ids),
            this.topicRepository.findById(view.topic_id),
            view.created_by ? this.userRepository.findUserById(view.created_by) : null,
            view.updated_by ? this.userRepository.findUserById(view.updated_by) : null,
            view.published_by ? this.userRepository.findUserById(view.published_by) : null,
        ]);
        return {
            article: {
                article_version_id: view.article_version_id,
                article_name: view.article_name,
                article_synopsis: view.article_synopsis,
                article_status: view.article_status,
                version: view.version,
                locked_by_user_id: view.locked_by_user_id,
                lock_expires_at: view.lock_expires_at,
                createdAt: view.createdAt,
                updatedAt: view.updatedAt,
                published_at: view.published_at,
                tags: tags.map((t) => ({ tag_id: t._id.toString(), tag_name: t.tag_name })),
                user: creator ? { first_name: creator.first_name, last_name: creator.last_name } : null,
                user_update: updater ? { first_name: updater.first_name, last_name: updater.last_name } : null,
                user_publish: publisher ? { first_name: publisher.first_name, last_name: publisher.last_name } : null,
                article: {
                    article_id: view.article_id,
                    topic: topic
                        ? { topic_id: topic.topic_id, topic_name: topic.topic_name, client_id: topic.client_id }
                        : { topic_id: view.topic_id, topic_name: '', client_id: '' },
                    user_id: view.user_id,
                },
            },
            available_for_client: view.available_for_client,
            available_for_ai: view.available_for_ai ?? false,
            article_property: view.article_property ?? 'paricus',
        };
    }
    async getArticleDocumentById(versionId) {
        const article = await this.articleRepository.findByVersionId(versionId);
        if (!article)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        return article.content;
    }
    // ─── Lifecycle ────────────────────────────────────────────────────────────────
    async moveArticleToTopic(input, _userId) {
        const data = MoveArticleSchema_1.MoveArticleSchema.parse(input);
        const topic = await this.topicRepository.findById(data.topicId);
        if (!topic)
            throw new NotFoundError_1.NotFoundError('Topic', data.topicId);
        await this.articleRepository.moveArticlesToTopic(data.articleIds, data.topicId);
    }
    async getArticleVersionsByArticleVersionId(versionId) {
        const versions = await this.articleRepository.findVersionsByVersionId(versionId);
        if (versions.length === 0)
            throw new BusinessLogicError_1.BusinessLogicError('No versions found.');
        return versions;
    }
    async publishVersion(versionId) {
        const article = await this.articleRepository.findByVersionId(versionId);
        if (!article)
            throw new NotFoundError_1.NotFoundError('Article version', versionId);
        if (article.article_status !== 'draft' && article.article_status !== 'unpublished') {
            throw new BusinessLogicError_1.BusinessLogicError('Article must be in draft or unpublished status to publish.');
        }
        await this.articleRepository.updateVersionStatus(versionId, 'published');
        const updated = await this.articleRepository.findByVersionId(versionId);
        if (!updated)
            throw new NotFoundError_1.NotFoundError('Article version', versionId);
        return updated;
    }
    async unpublishVersion(versionId) {
        const article = await this.articleRepository.findByVersionId(versionId);
        if (!article)
            throw new NotFoundError_1.NotFoundError('Article version', versionId);
        if (article.article_status !== 'published') {
            throw new BusinessLogicError_1.BusinessLogicError('Article is not in published status.');
        }
        await this.articleRepository.updateVersionStatus(versionId, 'unpublished');
        const updated = await this.articleRepository.findByVersionId(versionId);
        if (!updated)
            throw new NotFoundError_1.NotFoundError('Article version', versionId);
        return updated;
    }
    async setArticleAvailability(versionId, available) {
        const article = await this.articleRepository.findByVersionId(versionId);
        if (!article)
            throw new NotFoundError_1.NotFoundError('Article version', versionId);
        await this.articleRepository.setAvailableForClient(versionId, available);
        return { available_for_client: available };
    }
    async setArticleAiAvailability(versionId, available) {
        const article = await this.articleRepository.findByVersionId(versionId);
        if (!article)
            throw new NotFoundError_1.NotFoundError('Article version', versionId);
        await this.articleRepository.setAvailableForAi(versionId, available);
        return { available_for_ai: available };
    }
    async setArticleProperty(versionId, property) {
        const article = await this.articleRepository.findByVersionId(versionId);
        if (!article)
            throw new NotFoundError_1.NotFoundError('Article version', versionId);
        await this.articleRepository.setArticleProperty(versionId, property);
        return { article_property: property };
    }
    async publishVersions(versionIds) {
        const versions = await this.articleRepository.findByVersionIds(versionIds);
        if (versions.length === 0)
            throw new BusinessLogicError_1.BusinessLogicError('No versions found.');
        for (const v of versions) {
            if (v.article_status !== 'unpublished') {
                throw new BusinessLogicError_1.BusinessLogicError(`Version ${v.article_version_id} is not in unpublished status.`);
            }
        }
        await this.articleRepository.updateVersionsStatus(versionIds, 'published');
    }
    async unpublishVersions(versionIds) {
        const versions = await this.articleRepository.findByVersionIds(versionIds);
        if (versions.length === 0)
            throw new BusinessLogicError_1.BusinessLogicError('No versions found.');
        for (const v of versions) {
            if (v.article_status !== 'published') {
                throw new BusinessLogicError_1.BusinessLogicError(`Version ${v.article_version_id} is not in published status.`);
            }
        }
        await this.articleRepository.updateVersionsStatus(versionIds, 'unpublished');
    }
    // ─── External client portal ───────────────────────────────────────────────────
    /** Resolves clientSharedId → client → topics, then delegates to the repo.
     *  Optional `topicId` narrows the result to that single topic (validated to
     *  belong to the client). */
    async resolveTopicIdsForSharedClient(clientSharedId, topicId) {
        const client = await this.clientRepository.findBySharedId(clientSharedId);
        if (!client)
            return [];
        const topics = await this.topicRepository.findAllByClientId(client.client_id);
        if (!topicId) {
            return topics.map((t) => t.topic_id);
        }
        return topics.filter((t) => t.topic_id === topicId).map((t) => t.topic_id);
    }
    /** Lists every topic of a client. Used by the portal sidebar to render the
     *  folder tree (consumer rebuilds the tree from `parent_topic_id`). */
    async getTopicsBySharedClientId(clientSharedId) {
        const client = await this.clientRepository.findBySharedId(clientSharedId);
        if (!client)
            throw new NotFoundError_1.NotFoundError('Client', clientSharedId);
        return this.topicRepository.findAllByClientId(client.client_id);
    }
    // ─── Managed writes (portal write API, X-API-Key INTERNAL_WRITE_API_KEY) ──────
    /** Actor recorded on portal-originated writes. Not a real intranet user —
     *  valid UUID shape so Postgres user joins don't error; resolves to null.
     *  The human-readable author goes in `updated_by_name` (actorName). */
    static PORTAL_ACTOR_ID = '00000000-0000-4000-8000-000000000001';
    /** Resolves a client copy by its copy id and asserts it belongs to one of the
     *  client's topics. Used by portal writes, which address articles by copy id. */
    async resolveOwnedClientCopy(clientSharedId, copyId) {
        const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
        const copy = await this.articleRepository.getClientCopyByCopyId(copyId);
        if (!copy || !topicIds.includes(copy.topic_id)) {
            throw new NotFoundError_1.NotFoundError('Article', copyId);
        }
        return copy;
    }
    async createManagedArticle(clientSharedId, input) {
        const data = ManagedArticleSchemas_1.CreateManagedArticleSchema.parse(input);
        const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId, data.topicId);
        if (topicIds.length === 0)
            throw new NotFoundError_1.NotFoundError('Topic', data.topicId);
        // Portal-created articles go live immediately: published + visible.
        const created = await this.articleRepository.createArticle(data.topicId, ArticleService_1.PORTAL_ACTOR_ID, data.articleName, data.content, data.actorName);
        if (data.synopsis) {
            await this.articleRepository.updateVersionSynopsis(created.article_version_id, data.synopsis);
        }
        await this.articleRepository.updateVersionStatus(created.article_version_id, 'published');
        await this.articleRepository.setAvailableForClient(created.article_version_id, true);
        // Articles created by the client from the portal are, by definition, their
        // own creation. Set server-side so it cannot be spoofed via the write API.
        await this.articleRepository.setArticleProperty(created.article_version_id, 'client_self_created');
        if (data.content && data.content.trim()) {
            await this.chunkingService.processVersionSafe(created.article_id, created.article_version_id, data.content, 'internal');
        }
        // The client copy (seeded on create with the same content) is what the
        // client actually sees — chunk it for the external search too.
        const copy = await this.articleRepository.getClientCopyByArticleId(created.article_id);
        if (copy && copy.content.trim()) {
            await this.chunkingService.processVersionSafe(copy.article_id, copy.client_copy_id, copy.content, 'client');
        }
        const updated = await this.articleRepository.findByVersionId(created.article_version_id);
        return updated ?? created;
    }
    /** Portal edits target the CLIENT COPY (addressed by its copy id), never the
     *  internal versions — so internal language can never leak to the client. */
    async updateManagedArticle(clientSharedId, copyId, input) {
        const data = ManagedArticleSchemas_1.UpdateManagedArticleSchema.parse(input);
        const current = await this.resolveOwnedClientCopy(clientSharedId, copyId);
        const updated = await this.articleRepository.updateClientCopy(current.article_id, { content: data.content, name: data.articleName, synopsis: data.synopsis }, ArticleService_1.PORTAL_ACTOR_ID, data.actorName);
        if (!updated)
            throw new NotFoundError_1.NotFoundError('Article', copyId);
        if (data.content !== undefined) {
            await this.chunkingService.processVersionSafe(updated.article_id, updated.client_copy_id, data.content, 'client');
        }
        return updated;
    }
    /** Portal "delete" hides the client copy (unpublishes it) and drops its
     *  search chunks. The internal article is left untouched. */
    async archiveManagedArticle(clientSharedId, copyId) {
        const current = await this.resolveOwnedClientCopy(clientSharedId, copyId);
        await this.articleRepository.setAvailableForClientByArticleId(current.article_id, false);
        await this.chunkingService.processVersionSafe(current.article_id, current.client_copy_id, '', 'client');
        return { article_status: 'unavailable' };
    }
    async findSharedArticlesByClientSharedId(filters, clientSharedId, topicId) {
        const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId, topicId);
        if (topicIds.length === 0)
            return [];
        // When a search query is present we use the hybrid (vector + text) search
        // service powered by Gemini embeddings instead of a plain Mongo $text
        // match. We over-fetch from the search service because we still need to
        // drop articles that are not flagged `available_for_client` for this
        // public endpoint; without the buffer a few admin-only top hits could
        // shrink the returned list below the caller's `limit`.
        // Client-facing reads source the CLIENT COPY, never internal versions.
        const search = filters.search?.trim();
        if (search) {
            const overFetch = Math.max(filters.limit * 3, 50);
            const hits = await this.searchService.search(search, {
                topicIds,
                audience: 'client',
                limit: overFetch,
            });
            const visible = hits.filter((h) => h.article.available_for_client === true);
            return visible.slice(0, filters.limit).map((h) => ({
                article_id: h.article.article_version_id, // = client_copy_id
                article_name: h.article.article_name,
                article_synopsis: h.article.article_synopsis,
                updated_at: h.article.updatedAt,
                article_property: h.article.article_property,
                _score: h.score,
            }));
        }
        const copies = await this.articleRepository.findClientFacingByTopicIds(topicIds);
        return copies.map((c) => ({
            article_id: c.client_copy_id,
            article_name: c.article_name,
            article_synopsis: c.article_synopsis,
            updated_at: c.updatedAt,
            article_property: c.article_property,
        }));
    }
    async getArticleByExternalClientAndArticleId(clientSharedId, copyId) {
        const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
        if (topicIds.length === 0)
            throw new NotFoundError_1.NotFoundError('Client', clientSharedId);
        const copy = await this.articleRepository.findClientFacingByCopyId(topicIds, copyId);
        if (!copy)
            throw new NotFoundError_1.NotFoundError('Article', copyId);
        return {
            article: {
                article_id: copy.client_copy_id,
                article_name: copy.article_name,
                article_synopsis: copy.article_synopsis,
                updated_at: copy.updatedAt,
                article_property: copy.article_property,
            },
            content: copy.content,
        };
    }
    // ─── Admin variants (ignore `available_for_client` flag) ─────────────────────
    async findAllPublishedByClientSharedId(filters, clientSharedId, topicId) {
        const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId, topicId);
        if (topicIds.length === 0)
            return [];
        // Admin variant still sources the client copy (the portal never shows
        // internal content), but ignores `available_for_client` so BPO admins can
        // see/edit copies before they are published to the client.
        const search = filters.search?.trim();
        if (search) {
            const hits = await this.searchService.search(search, {
                topicIds,
                audience: 'client',
                limit: filters.limit,
            });
            return hits.map((h) => ({
                article_id: h.article.article_version_id,
                article_name: h.article.article_name,
                article_synopsis: h.article.article_synopsis,
                updated_at: h.article.updatedAt,
                article_property: h.article.article_property,
                _score: h.score,
            }));
        }
        const copies = await this.articleRepository.findClientFacingByTopicIds(topicIds, true);
        return copies.map((c) => ({
            article_id: c.client_copy_id,
            article_name: c.article_name,
            article_synopsis: c.article_synopsis,
            updated_at: c.updatedAt,
            article_property: c.article_property,
        }));
    }
    async getArticleByExternalClientAndArticleIdAdmin(clientSharedId, copyId) {
        const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
        if (topicIds.length === 0)
            throw new NotFoundError_1.NotFoundError('Client', clientSharedId);
        const copy = await this.articleRepository.findClientFacingByCopyId(topicIds, copyId, true);
        if (!copy)
            throw new NotFoundError_1.NotFoundError('Article', copyId);
        return {
            article: {
                article_id: copy.client_copy_id,
                article_name: copy.article_name,
                article_synopsis: copy.article_synopsis,
                updated_at: copy.updatedAt,
                article_property: copy.article_property,
            },
            content: copy.content,
        };
    }
    /** Re-runs the chunking + Gemini embedding pipeline across every published
     *  version (or only those of a given client). Used to backfill the vector
     *  index for articles that pre-date the chunker. Returns counts so callers
     *  can confirm coverage. */
    async reindexAllPublishedChunks(clientSharedId) {
        let topicIds;
        if (clientSharedId) {
            topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
            if (topicIds.length === 0) {
                return { processed: 0, failed: 0, skipped: 0 };
            }
        }
        const versions = await this.articleRepository.findAllPublishedVersionsForChunking(topicIds);
        let processed = 0;
        let failed = 0;
        let skipped = 0;
        for (const v of versions) {
            if (!v.content || !v.content.trim()) {
                skipped++;
                continue;
            }
            try {
                await this.chunkingService.processVersion(v.article_id, v.version_id, v.content, 'internal');
                processed++;
            }
            catch {
                // chunkingService logs its own error; just count and move on so one
                // bad article doesn't abort the rest of the backfill.
                failed++;
            }
        }
        // Also (re)index the client copies so the external/portal search works,
        // including copies seeded by the dual-view backfill.
        const copies = await this.articleRepository.findAllClientCopiesForChunking(topicIds);
        for (const c of copies) {
            if (!c.content || !c.content.trim()) {
                skipped++;
                continue;
            }
            try {
                await this.chunkingService.processVersion(c.article_id, c.copy_id, c.content, 'client');
                processed++;
            }
            catch {
                failed++;
            }
        }
        return { processed, failed, skipped };
    }
};
exports.ArticleService = ArticleService;
exports.ArticleService = ArticleService = ArticleService_1 = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.ITopicRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IClientRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __param(4, (0, inversify_1.inject)(containerTypes_1.TYPES.ITagRepository)),
    __param(5, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleChunkingService)),
    __param(6, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleSearchService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, articleChunking_service_1.ArticleChunkingService,
        articleSearch_service_1.ArticleSearchService])
], ArticleService);
//# sourceMappingURL=article.service.js.map