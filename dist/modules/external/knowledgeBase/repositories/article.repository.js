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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleRepository = void 0;
const inversify_1 = require("inversify");
const mongodb_1 = require("mongodb");
const cheerio = __importStar(require("cheerio"));
const kb_collections_1 = require("../database/kb-collections");
const mongo_connection_1 = require("../../../../shared/database/mongo-connection");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
let ArticleRepository = class ArticleRepository {
    get col() {
        return (0, kb_collections_1.getArticlesCollection)((0, mongo_connection_1.getMongoDb)());
    }
    // ─── Private helpers ──────────────────────────────────────────────────────────
    htmlToText(html) {
        const $ = cheerio.load(html);
        return $.root().text().replace(/\s+/g, ' ').trim();
    }
    /** Converts a KbArticle root + one of its versions into a flat, serializable view. */
    toView(article, version) {
        return {
            article_id: article._id.toString(),
            topic_id: article.topic_id,
            user_id: article.user_id,
            locked_by_user_id: article.locked_by_user_id,
            lock_expires_at: article.lock_expires_at,
            available_for_client: article.available_for_client,
            article_version_id: version._id.toString(),
            article_name: version.article_name,
            article_synopsis: version.article_synopsis,
            article_status: version.article_status,
            version: version.version,
            content: version.content,
            content_storage: version.content_storage,
            tag_ids: version.tag_ids.map((id) => id.toString()),
            created_by: version.created_by,
            updated_by: version.updated_by,
            updated_by_name: version.updated_by_name ?? null,
            published_by: version.published_by,
            published_at: version.published_at,
            createdAt: version.createdAt,
            updatedAt: version.updatedAt,
        };
    }
    /** Builds the aggregation pipeline stages to unwind versions and apply filters.
     *  Text search stage (if any) must be added BEFORE calling this. */
    buildVersionFilterStages(filters, canSeeDraft, forceStatus) {
        const { tagId } = filters;
        const allowedStatuses = ['published', 'unpublished', 'outdated', 'archived'];
        if (canSeeDraft)
            allowedStatuses.push('draft');
        const stages = [
            { $unwind: '$versions' },
            {
                $addFields: {
                    'versions.article_id': '$_id',
                    'versions.topic_id_root': '$topic_id',
                    'versions.user_id_root': '$user_id',
                    'versions.locked_by_user_id': '$locked_by_user_id',
                    'versions.lock_expires_at': '$lock_expires_at',
                    'versions.available_for_client': '$available_for_client',
                },
            },
            { $match: { 'versions.article_status': { $in: allowedStatuses } } },
        ];
        if (forceStatus) {
            stages.push({ $match: { 'versions.article_status': forceStatus } });
        }
        // tagId comes as string[] after FilterArticleSchema transform
        const tagIds = Array.isArray(tagId) ? tagId : tagId ? [tagId] : [];
        const validTagOids = tagIds
            .filter((id) => mongodb_1.ObjectId.isValid(id))
            .map((id) => new mongodb_1.ObjectId(id));
        if (validTagOids.length > 0) {
            stages.push({ $match: { 'versions.tag_ids': { $in: validTagOids } } });
        }
        return stages;
    }
    /** Maps an aggregation result (after $unwind + $addFields) back to a view. */
    aggDocToView(doc) {
        const v = doc['versions'];
        return {
            article_id: v['article_id'].toString(),
            topic_id: v['topic_id_root'],
            user_id: v['user_id_root'] ?? null,
            locked_by_user_id: v['locked_by_user_id'] ?? null,
            lock_expires_at: v['lock_expires_at'] ?? null,
            available_for_client: v['available_for_client'],
            article_version_id: v['_id'].toString(),
            article_name: v['article_name'],
            article_synopsis: v['article_synopsis'],
            article_status: v['article_status'],
            version: v['version'],
            content: v['content'] ?? '',
            content_storage: v['content_storage'] ?? 'inline',
            tag_ids: (v['tag_ids'] ?? []).map((id) => id.toString()),
            created_by: v['created_by'] ?? null,
            updated_by: v['updated_by'] ?? null,
            updated_by_name: v['updated_by_name'] ?? null,
            published_by: v['published_by'] ?? null,
            published_at: v['published_at'] ?? null,
            createdAt: v['createdAt'],
            updatedAt: v['updatedAt'],
        };
    }
    // ─── Creation ─────────────────────────────────────────────────────────────────
    async createArticle(topicId, userId, articleName, content, updatedByName = null) {
        const now = new Date();
        const articleId = new mongodb_1.ObjectId();
        const versionId = new mongodb_1.ObjectId();
        const firstVersion = {
            _id: versionId,
            article_name: articleName,
            article_synopsis: '',
            article_status: 'draft',
            version: 1,
            content,
            content_text: this.htmlToText(content),
            content_storage: 'inline',
            tag_ids: [],
            created_by: userId,
            updated_by: userId,
            updated_by_name: updatedByName,
            published_by: null,
            published_at: null,
            createdAt: now,
            updatedAt: now,
        };
        const doc = {
            _id: articleId,
            topic_id: topicId,
            user_id: userId,
            locked_by_user_id: null,
            lock_expires_at: null,
            available_for_client: false,
            versions: [firstVersion],
            createdAt: now,
            updatedAt: now,
        };
        await this.col.insertOne(doc);
        return this.toView(doc, firstVersion);
    }
    async addVersion(existingVersionId, options) {
        if (!mongodb_1.ObjectId.isValid(existingVersionId)) {
            throw new NotFoundError_1.NotFoundError('Version', existingVersionId);
        }
        const vOid = new mongodb_1.ObjectId(existingVersionId);
        const article = await this.col.findOne({ 'versions._id': vOid });
        if (!article)
            throw new NotFoundError_1.NotFoundError('Article', existingVersionId);
        const templateVersion = article.versions.find((v) => v._id.equals(vOid));
        if (!templateVersion)
            throw new NotFoundError_1.NotFoundError('Version', existingVersionId);
        const latestVersionNumber = article.versions.length > 0
            ? Math.max(...article.versions.map((v) => v.version))
            : 0;
        const now = new Date();
        const newVersionId = new mongodb_1.ObjectId();
        const newVersion = {
            _id: newVersionId,
            article_name: options.useVersionAsTemplate ? templateVersion.article_name : '',
            article_synopsis: options.useVersionAsTemplate ? templateVersion.article_synopsis : '',
            article_status: 'draft',
            version: latestVersionNumber + 1,
            content: options.useVersionAsTemplate ? templateVersion.content : '',
            content_text: options.useVersionAsTemplate ? this.htmlToText(templateVersion.content) : '',
            content_storage: 'inline',
            tag_ids: options.useVersionAsTemplate ? [...templateVersion.tag_ids] : [],
            created_by: options.userId,
            updated_by: options.userId,
            updated_by_name: options.updatedByName ?? null,
            published_by: null,
            published_at: null,
            createdAt: now,
            updatedAt: now,
        };
        await this.col.updateOne({ _id: article._id }, { $push: { versions: newVersion }, $set: { updatedAt: now } });
        return this.toView(article, newVersion);
    }
    // ─── Reads ────────────────────────────────────────────────────────────────────
    async findByVersionId(versionId) {
        if (!mongodb_1.ObjectId.isValid(versionId))
            return null;
        const vOid = new mongodb_1.ObjectId(versionId);
        const article = await this.col.findOne({ 'versions._id': vOid });
        if (!article)
            return null;
        const version = article.versions.find((v) => v._id.equals(vOid));
        if (!version)
            return null;
        return this.toView(article, version);
    }
    async findByVersionIds(versionIds) {
        const oids = versionIds
            .filter((id) => mongodb_1.ObjectId.isValid(id))
            .map((id) => new mongodb_1.ObjectId(id));
        if (oids.length === 0)
            return [];
        const articles = await this.col
            .find({ 'versions._id': { $in: oids } })
            .toArray();
        const views = [];
        for (const article of articles) {
            for (const oid of oids) {
                const version = article.versions.find((v) => v._id.equals(oid));
                if (version)
                    views.push(this.toView(article, version));
            }
        }
        return views;
    }
    async findVersionsByVersionId(versionId) {
        if (!mongodb_1.ObjectId.isValid(versionId))
            return [];
        const vOid = new mongodb_1.ObjectId(versionId);
        const article = await this.col.findOne({ 'versions._id': vOid });
        if (!article)
            return [];
        return article.versions
            .sort((a, b) => b.version - a.version)
            .map((v) => this.toView(article, v));
    }
    async findAllLatestByTopicId(topicId) {
        const articles = await this.col
            .find({ topic_id: topicId })
            .sort({ updatedAt: -1 })
            .toArray();
        return articles
            .filter((article) => article.versions.length > 0)
            .map((article) => {
            const latest = article.versions.reduce((max, v) => v.version > max.version ? v : max);
            return this.toView(article, latest);
        });
    }
    async findRecentByTopicIds(topicIds, limit = 10) {
        if (topicIds.length === 0)
            return [];
        const articles = await this.col
            .find({ topic_id: { $in: topicIds } })
            .sort({ updatedAt: -1 })
            .limit(limit)
            .toArray();
        return articles
            .filter((article) => article.versions.length > 0)
            .map((article) => {
            const latest = article.versions.reduce((max, v) => v.version > max.version ? v : max);
            return this.toView(article, latest);
        });
    }
    // ─── Paginated lists ──────────────────────────────────────────────────────────
    async findAndCountByTopicId(topicId, filters, canSeeDraft) {
        const { search, page = 1, limit = 20 } = filters;
        const matchStages = [
            ...(search ? [{ $match: { $text: { $search: search } } }] : []),
            { $match: { topic_id: topicId } },
        ];
        return this.paginateVersionPipeline(matchStages, filters, canSeeDraft, page, limit);
    }
    async findAndCountByTopicIds(topicIds, filters, canSeeDraft) {
        if (topicIds.length === 0)
            return { articles: [], total: 0 };
        const { search, page = 1, limit = 20 } = filters;
        const matchStages = [
            ...(search ? [{ $match: { $text: { $search: search } } }] : []),
            { $match: { topic_id: { $in: topicIds } } },
        ];
        return this.paginateVersionPipeline(matchStages, filters, canSeeDraft, page, limit);
    }
    async findAndCount(filters, canSeeDraft) {
        const { search, page = 1, limit = 20 } = filters;
        const matchStages = [
            ...(search ? [{ $match: { $text: { $search: search } } }] : []),
        ];
        return this.paginateVersionPipeline(matchStages, filters, canSeeDraft, page, limit);
    }
    /** Shared pagination helper for all findAndCount* methods. */
    async paginateVersionPipeline(preMatchStages, filters, canSeeDraft, page, limit) {
        const filterStages = this.buildVersionFilterStages(filters, canSeeDraft);
        const basePipeline = [...preMatchStages, ...filterStages];
        const skip = (page - 1) * limit;
        const [countResult, docs] = await Promise.all([
            this.col
                .aggregate([...basePipeline, { $count: 'total' }])
                .toArray(),
            this.col
                .aggregate([
                ...basePipeline,
                { $sort: { 'versions.updatedAt': -1 } },
                { $skip: skip },
                { $limit: limit },
                { $project: { 'versions.content': 0 } }, // exclude content from list view
            ])
                .toArray(),
        ]);
        const total = countResult[0]?.total ?? 0;
        const articles = docs.map((d) => this.aggDocToView(d));
        return { articles, total };
    }
    // ─── Atomic updates ───────────────────────────────────────────────────────────
    async updateVersionContent(versionId, content, updatedBy, updatedByName = null) {
        if (!mongodb_1.ObjectId.isValid(versionId))
            throw new NotFoundError_1.NotFoundError('Version', versionId);
        const now = new Date();
        await this.col.updateOne({ 'versions._id': new mongodb_1.ObjectId(versionId) }, {
            $set: {
                'versions.$.content': content,
                'versions.$.content_text': this.htmlToText(content),
                'versions.$.updated_by': updatedBy,
                'versions.$.updated_by_name': updatedByName,
                'versions.$.updatedAt': now,
                updatedAt: now,
            },
        });
    }
    async updateVersionName(versionId, name) {
        if (!mongodb_1.ObjectId.isValid(versionId))
            throw new NotFoundError_1.NotFoundError('Version', versionId);
        const now = new Date();
        await this.col.updateOne({ 'versions._id': new mongodb_1.ObjectId(versionId) }, {
            $set: {
                'versions.$.article_name': name,
                'versions.$.updatedAt': now,
                updatedAt: now,
            },
        });
    }
    async updateVersionSynopsis(versionId, synopsis) {
        if (!mongodb_1.ObjectId.isValid(versionId))
            throw new NotFoundError_1.NotFoundError('Version', versionId);
        const now = new Date();
        await this.col.updateOne({ 'versions._id': new mongodb_1.ObjectId(versionId) }, {
            $set: {
                'versions.$.article_synopsis': synopsis,
                'versions.$.updatedAt': now,
                updatedAt: now,
            },
        });
    }
    async updateVersionStatus(versionId, status, publishedBy) {
        if (!mongodb_1.ObjectId.isValid(versionId))
            throw new NotFoundError_1.NotFoundError('Version', versionId);
        const now = new Date();
        const setFields = {
            'versions.$.article_status': status,
            'versions.$.updatedAt': now,
            updatedAt: now,
        };
        if (status === 'published') {
            setFields['versions.$.published_at'] = now;
            if (publishedBy)
                setFields['versions.$.published_by'] = publishedBy;
        }
        await this.col.updateOne({ 'versions._id': new mongodb_1.ObjectId(versionId) }, { $set: setFields });
    }
    async updateVersionsStatus(versionIds, status) {
        const oids = versionIds
            .filter((id) => mongodb_1.ObjectId.isValid(id))
            .map((id) => new mongodb_1.ObjectId(id));
        if (oids.length === 0)
            return;
        const now = new Date();
        await this.col.updateMany({ 'versions._id': { $in: oids } }, {
            $set: {
                'versions.$[elem].article_status': status,
                'versions.$[elem].updatedAt': now,
                updatedAt: now,
            },
        }, { arrayFilters: [{ 'elem._id': { $in: oids } }] });
    }
    // ─── Edit locks ───────────────────────────────────────────────────────────────
    async acquireLock(versionId, userId, expiresAt) {
        if (!mongodb_1.ObjectId.isValid(versionId))
            throw new NotFoundError_1.NotFoundError('Version', versionId);
        await this.col.updateOne({ 'versions._id': new mongodb_1.ObjectId(versionId) }, { $set: { locked_by_user_id: userId, lock_expires_at: expiresAt, updatedAt: new Date() } });
    }
    async refreshLock(versionId, expiresAt) {
        if (!mongodb_1.ObjectId.isValid(versionId))
            throw new NotFoundError_1.NotFoundError('Version', versionId);
        await this.col.updateOne({ 'versions._id': new mongodb_1.ObjectId(versionId) }, { $set: { lock_expires_at: expiresAt, updatedAt: new Date() } });
    }
    async releaseLock(versionId) {
        if (!mongodb_1.ObjectId.isValid(versionId))
            throw new NotFoundError_1.NotFoundError('Version', versionId);
        await this.col.updateOne({ 'versions._id': new mongodb_1.ObjectId(versionId) }, { $set: { locked_by_user_id: null, lock_expires_at: null, updatedAt: new Date() } });
    }
    async releaseAllLocks() {
        await this.col.updateMany({ locked_by_user_id: { $ne: null } }, { $set: { locked_by_user_id: null, lock_expires_at: null, updatedAt: new Date() } });
    }
    async getLockInfo(versionId) {
        if (!mongodb_1.ObjectId.isValid(versionId))
            return null;
        const article = await this.col.findOne({ 'versions._id': new mongodb_1.ObjectId(versionId) }, { projection: { locked_by_user_id: 1, lock_expires_at: 1 } });
        if (!article)
            return null;
        return {
            locked_by_user_id: article.locked_by_user_id,
            lock_expires_at: article.lock_expires_at,
        };
    }
    // ─── Tags ─────────────────────────────────────────────────────────────────────
    async addTagToVersion(versionId, tagId) {
        if (!mongodb_1.ObjectId.isValid(versionId) || !mongodb_1.ObjectId.isValid(tagId))
            return;
        const now = new Date();
        await this.col.updateOne({ 'versions._id': new mongodb_1.ObjectId(versionId) }, {
            $addToSet: { 'versions.$.tag_ids': new mongodb_1.ObjectId(tagId) },
            $set: { 'versions.$.updatedAt': now, updatedAt: now },
        });
    }
    async removeTagFromVersion(versionId, tagId) {
        if (!mongodb_1.ObjectId.isValid(versionId) || !mongodb_1.ObjectId.isValid(tagId))
            return;
        const now = new Date();
        await this.col.updateOne({ 'versions._id': new mongodb_1.ObjectId(versionId) }, {
            $pull: { 'versions.$.tag_ids': new mongodb_1.ObjectId(tagId) },
            $set: { 'versions.$.updatedAt': now, updatedAt: now },
        });
    }
    // ─── Bulk operations ──────────────────────────────────────────────────────────
    async moveArticlesToTopic(versionIds, topicId) {
        const oids = versionIds
            .filter((id) => mongodb_1.ObjectId.isValid(id))
            .map((id) => new mongodb_1.ObjectId(id));
        if (oids.length === 0)
            return;
        await this.col.updateMany({ 'versions._id': { $in: oids } }, { $set: { topic_id: topicId, updatedAt: new Date() } });
    }
    // ─── Maintenance ──────────────────────────────────────────────────────────────
    async clearExpiredLocks() {
        const result = await this.col.updateMany({ lock_expires_at: { $lt: new Date() } }, { $set: { locked_by_user_id: null, lock_expires_at: null, updatedAt: new Date() } });
        return result.modifiedCount;
    }
    // ─── External client portal ───────────────────────────────────────────────────
    /** Returns published articles for the given topic IDs.
     *  By default restricts to articles marked `available_for_client: true`.
     *  When `includeUnavailable` is true, returns ALL published articles regardless of that flag
     *  (used by the admin endpoint).
     *  Client/topic resolution is the caller's responsibility (ArticleService). */
    async findPublishedByTopicIds(topicIds, filters, includeUnavailable = false) {
        if (topicIds.length === 0)
            return [];
        const { search } = filters;
        const articleMatch = { topic_id: { $in: topicIds } };
        if (!includeUnavailable)
            articleMatch['available_for_client'] = true;
        const matchStages = [
            ...(search ? [{ $match: { $text: { $search: search } } }] : []),
            { $match: articleMatch },
        ];
        const filterStages = this.buildVersionFilterStages(filters, false, 'published');
        const docs = await this.col
            .aggregate([
            ...matchStages,
            ...filterStages,
            { $sort: { 'versions.updatedAt': -1 } },
            { $project: { 'versions.content': 0 } },
        ])
            .toArray();
        return docs.map((d) => this.aggDocToView(d));
    }
    /** Returns a single published version for the given topic IDs.
     *  By default restricts to articles marked `available_for_client: true`.
     *  When `includeUnavailable` is true, ignores that flag (admin endpoint).
     *  Client/topic resolution is the caller's responsibility (ArticleService). */
    async findPublishedVersionByTopicIds(topicIds, versionId, includeUnavailable = false) {
        if (!mongodb_1.ObjectId.isValid(versionId))
            return null;
        if (topicIds.length === 0)
            return null;
        const vOid = new mongodb_1.ObjectId(versionId);
        const articleFilter = {
            topic_id: { $in: topicIds },
            'versions._id': vOid,
        };
        if (!includeUnavailable)
            articleFilter['available_for_client'] = true;
        const article = await this.col.findOne(articleFilter);
        if (!article)
            return null;
        const version = article.versions.find((v) => v._id.equals(vOid) && v.article_status === 'published');
        if (!version)
            return null;
        return this.toView(article, version);
    }
};
exports.ArticleRepository = ArticleRepository;
exports.ArticleRepository = ArticleRepository = __decorate([
    (0, inversify_1.injectable)()
], ArticleRepository);
//# sourceMappingURL=article.repository.js.map