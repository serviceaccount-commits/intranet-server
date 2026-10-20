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
exports.TopicService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const AuthenticationError_1 = require("../../../../shared/errors/AuthenticationError");
const ValidationError_1 = require("../../../../shared/errors/ValidationError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const CreateTopicSchema_1 = require("../schema/topics/CreateTopicSchema");
const UpdateTopicSchema_1 = require("../schema/topics/UpdateTopicSchema");
const ManagedTopicSchemas_1 = require("../schema/manage/ManagedTopicSchemas");
const kbAccess_service_1 = require("./kbAccess.service");
const articleChunking_service_1 = require("./articleChunking.service");
let TopicService = class TopicService {
    topicRepository;
    articleRepository;
    clientRepository;
    userRepository;
    kbAccess;
    chunkingService;
    constructor(topicRepository, articleRepository, clientRepository, userRepository, kbAccess, chunkingService) {
        this.topicRepository = topicRepository;
        this.articleRepository = articleRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.kbAccess = kbAccess;
        this.chunkingService = chunkingService;
    }
    async createTopic(input) {
        const data = CreateTopicSchema_1.CreateTopicSchema.parse(input);
        if (!data.userId)
            throw new AuthenticationError_1.AuthenticationError('User not authenticated.');
        const user = await this.userRepository.findUserById(data.userId);
        if (!user)
            throw new NotFoundError_1.NotFoundError('User', data.userId);
        const client = await this.clientRepository.findById(data.clientId);
        if (!client)
            throw new NotFoundError_1.NotFoundError('Client', data.clientId);
        // When a parent is given, validate that it belongs to the same client so
        // folders never get tangled across tenants.
        if (data.parentTopicId) {
            const parent = await this.topicRepository.findById(data.parentTopicId);
            if (!parent)
                throw new NotFoundError_1.NotFoundError('Topic', data.parentTopicId);
            if (parent.client_id !== client.client_id) {
                throw new ValidationError_1.ValidationError('Parent folder belongs to a different client.');
            }
        }
        return this.topicRepository.create({
            topic_name: data.topicName,
            topic_edit_available: true,
            client_id: client.client_id,
            parent_topic_id: data.parentTopicId ?? null,
            user_id: data.userId,
        });
    }
    async updateTopic(input) {
        const data = UpdateTopicSchema_1.UpdateTopicSchema.parse(input);
        const topic = await this.topicRepository.findById(data.topicId);
        if (!topic)
            throw new NotFoundError_1.NotFoundError('Topic', data.topicId);
        if (data.topicName !== undefined) {
            topic.topic_name = data.topicName;
        }
        // `parentTopicId` is only checked when the key is present in the payload.
        // Sending `null` explicitly means "promote to root of the client".
        if (Object.prototype.hasOwnProperty.call(data, 'parentTopicId')) {
            const newParentId = data.parentTopicId ?? null;
            if (newParentId === topic.topic_id) {
                throw new ValidationError_1.ValidationError('A folder cannot be its own parent.');
            }
            if (newParentId !== null) {
                const parent = await this.topicRepository.findById(newParentId);
                if (!parent)
                    throw new NotFoundError_1.NotFoundError('Topic', newParentId);
                if (parent.client_id !== topic.client_id) {
                    throw new ValidationError_1.ValidationError('Parent folder belongs to a different client.');
                }
                // Reject if the candidate parent is one of this topic's descendants:
                // that would create a cycle.
                const descendantIds = await this.topicRepository.findAllDescendantIds(topic.topic_id);
                if (descendantIds.includes(newParentId)) {
                    throw new ValidationError_1.ValidationError('Cannot move a folder under one of its own descendants.');
                }
            }
            topic.parent_topic_id = newParentId;
        }
        return this.topicRepository.save(topic);
    }
    // ─── Managed writes (portal write API, X-API-Key INTERNAL_WRITE_API_KEY) ──────
    /**
     * Create a folder/subfolder on behalf of a portal user. The client is
     * resolved from `clientSharedId`; no real intranet user is required.
     */
    async createManagedTopic(clientSharedId, input) {
        const data = ManagedTopicSchemas_1.CreateManagedTopicSchema.parse(input);
        const client = await this.clientRepository.findBySharedId(clientSharedId);
        if (!client)
            throw new NotFoundError_1.NotFoundError('Client', clientSharedId);
        // When a parent is given, validate that it belongs to the same client so
        // folders never get tangled across tenants.
        if (data.parentTopicId) {
            const parent = await this.topicRepository.findById(data.parentTopicId);
            if (!parent)
                throw new NotFoundError_1.NotFoundError('Topic', data.parentTopicId);
            if (parent.client_id !== client.client_id) {
                throw new ValidationError_1.ValidationError('Parent folder belongs to a different client.');
            }
        }
        // Portal users are not intranet users, so there is no owning user_id.
        // The column is nullable; the human author is conveyed via actorName.
        return this.topicRepository.create({
            topic_name: data.topicName,
            topic_edit_available: true,
            client_id: client.client_id,
            parent_topic_id: data.parentTopicId ?? null,
            user_id: null,
        });
    }
    /**
     * Rename and/or move a folder on behalf of a portal user. Verifies the topic
     * belongs to the resolved client, then delegates to the shared rename/move
     * logic (which guards self-parent, cross-tenant moves, and cycles).
     */
    async updateManagedTopic(clientSharedId, topicId, input) {
        const data = ManagedTopicSchemas_1.UpdateManagedTopicSchema.parse(input);
        const client = await this.clientRepository.findBySharedId(clientSharedId);
        if (!client)
            throw new NotFoundError_1.NotFoundError('Client', clientSharedId);
        const topic = await this.topicRepository.findById(topicId);
        if (!topic || topic.client_id !== client.client_id) {
            throw new NotFoundError_1.NotFoundError('Topic', topicId);
        }
        return this.updateTopic({
            topicId,
            ...(data.topicName !== undefined && { topicName: data.topicName }),
            ...(Object.prototype.hasOwnProperty.call(data, 'parentTopicId') && {
                parentTopicId: data.parentTopicId ?? null,
            }),
        });
    }
    /**
     * Delete a folder on behalf of a portal user. Only EMPTY folders are
     * deletable — no subfolders and no articles (any status) — so a portal
     * click can never orphan or drop real client content.
     */
    async deleteManagedTopic(clientSharedId, topicId) {
        const client = await this.clientRepository.findBySharedId(clientSharedId);
        if (!client)
            throw new NotFoundError_1.NotFoundError('Client', clientSharedId);
        const topic = await this.topicRepository.findById(topicId);
        if (!topic || topic.client_id !== client.client_id) {
            throw new NotFoundError_1.NotFoundError('Topic', topicId);
        }
        const descendantIds = await this.topicRepository.findAllDescendantIds(topicId);
        if (descendantIds.length > 0) {
            throw new BusinessLogicError_1.BusinessLogicError('The folder has subfolders. Move or delete them first.');
        }
        const articles = await this.articleRepository.findAllLatestByTopicId(topicId);
        if (articles.length > 0) {
            throw new BusinessLogicError_1.BusinessLogicError('The folder contains articles. Move or delete them first.');
        }
        await this.topicRepository.deleteById(topicId);
    }
    async getTopics(clientId, userId) {
        await this.kbAccess.assertClientAccess(userId, clientId);
        const topics = await this.topicRepository.findAllByClientId(clientId);
        const visible = await this.kbAccess.filterVisibleTopics(userId, topics);
        // Flag restricted folders so the tree can mark them
        const access = await this.topicRepository.findAccessByTopicIds(visible.map((t) => t.topic_id));
        return visible.map((t) => ({ ...t, is_restricted: access.has(t.topic_id) }));
    }
    async getTopicById(topicId, userId) {
        const topic = await this.topicRepository.findById(topicId);
        if (!topic)
            throw new NotFoundError_1.NotFoundError('Topic', topicId);
        await this.kbAccess.assertTopicAccess(userId, topicId);
        return topic;
    }
    // ─── Intranet folder deletion (kb:topic:manage) ───────────────────────────────
    /** The folder, its subfolders and the live (non-archived) articles inside. */
    async collectFolderContents(topicId) {
        const subfolderIds = await this.topicRepository.findAllDescendantIds(topicId);
        const topicIds = [topicId, ...subfolderIds];
        const latest = (await Promise.all(topicIds.map((id) => this.articleRepository.findAllLatestByTopicId(id)))).flat();
        const articleIds = [
            ...new Set(latest.filter((a) => a.article_status !== 'archived').map((a) => a.article_id)),
        ];
        return { topicIds, subfolderIds, articleIds };
    }
    async getTopicContents(topicId, userId) {
        await this.kbAccess.assertTopicAccess(userId, topicId);
        const { subfolderIds, articleIds } = await this.collectFolderContents(topicId);
        return { subfolders: subfolderIds.length, articles: articleIds.length };
    }
    /**
     * Deletes a folder and its subfolders (soft delete) and archives every
     * article inside, so all of it stays recoverable: restoring an archived
     * article brings its folder chain back (see ArticleService.restoreArticles).
     */
    async deleteTopic(topicId, userId) {
        await this.kbAccess.assertTopicAccess(userId, topicId);
        const { topicIds, subfolderIds, articleIds } = await this.collectFolderContents(topicId);
        if (articleIds.length > 0) {
            await this.articleRepository.archiveArticlesByIds(articleIds);
            for (const articleId of articleIds) {
                await this.chunkingService.clearArticle(articleId);
            }
        }
        await this.topicRepository.softDeleteByIds(topicIds);
        return { subfolders: subfolderIds.length, articles: articleIds.length };
    }
    // ─── Per-folder staff access (kb:topic:manage) ────────────────────────────────
    async getTopicAccess(topicId, userId) {
        const topic = await this.kbAccess.assertTopicAccess(userId, topicId);
        const access = await this.topicRepository.findAccessByTopicIds([topicId]);
        const allowedIds = [...(access.get(topicId) ?? [])];
        const [allowed, staff] = await Promise.all([
            this.topicRepository.findUsersByIds(allowedIds),
            this.topicRepository.findClientStaff(topic.client_id),
        ]);
        return { restricted: allowedIds.length > 0, allowed, staff };
    }
    /** Replaces who may see the folder. An empty list removes the restriction. */
    async setTopicAccess(topicId, userIds, userId) {
        const topic = await this.kbAccess.assertTopicAccess(userId, topicId);
        const unique = [...new Set(userIds)];
        if (unique.length > 0) {
            const staff = await this.topicRepository.findClientStaff(topic.client_id);
            const staffIds = new Set(staff.map((u) => u.user_id));
            if (unique.some((id) => !staffIds.has(id))) {
                throw new ValidationError_1.ValidationError('Only staff with access to this client can be given access to its folders.');
            }
            // Restricting a folder you are not on would lock you out of it
            if (!unique.includes(userId) && !(await this.kbAccess.hasFullAccess(userId))) {
                throw new ValidationError_1.ValidationError('Keep yourself on the list, or you will lose access to this folder.');
            }
        }
        await this.topicRepository.replaceAccess(topicId, unique);
    }
};
exports.TopicService = TopicService;
exports.TopicService = TopicService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ITopicRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IClientRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __param(4, (0, inversify_1.inject)(containerTypes_1.TYPES.IKbAccessService)),
    __param(5, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleChunkingService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, kbAccess_service_1.KbAccessService,
        articleChunking_service_1.ArticleChunkingService])
], TopicService);
//# sourceMappingURL=topic.service.js.map