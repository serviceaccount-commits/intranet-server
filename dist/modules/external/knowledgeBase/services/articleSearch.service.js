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
exports.ArticleSearchService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const kb_collections_1 = require("../database/kb-collections");
const mongo_connection_1 = require("../../../../shared/database/mongo-connection");
const ai_service_1 = require("../../../../shared/utils/ai.service");
const logger_1 = require("../../../../shared/utils/logger");
const RRF_K = 60;
const DEFAULT_LIMIT = 20;
const VECTOR_TOP_K = 50;
const TEXT_TOP_K = 50;
const PREVIEW_LENGTH = 280;
let ArticleSearchService = class ArticleSearchService {
    chunkRepository;
    articleRepository;
    // In-memory cache of all chunk embeddings. Refreshed lazily; safe to be
    // slightly stale because the persistence layer is the source of truth.
    cache = [];
    cacheLoadedAt = null;
    cacheTtlMs = 5 * 60 * 1000;
    constructor(chunkRepository, articleRepository) {
        this.chunkRepository = chunkRepository;
        this.articleRepository = articleRepository;
    }
    invalidateCache() {
        this.cacheLoadedAt = null;
    }
    async ensureCache() {
        const fresh = this.cacheLoadedAt !== null && Date.now() - this.cacheLoadedAt < this.cacheTtlMs;
        if (fresh && this.cache.length > 0)
            return;
        this.cache = await this.chunkRepository.loadAllForSearch();
        this.cacheLoadedAt = Date.now();
        logger_1.logger.info(`[search] chunk cache loaded: ${this.cache.length} chunks`);
    }
    async search(query, options = {}) {
        const trimmed = (query ?? '').trim();
        if (!trimmed)
            return [];
        const limit = options.limit ?? DEFAULT_LIMIT;
        const allowedStatuses = options.statuses ?? ['published'];
        const [vectorRanking, textRanking] = await Promise.all([
            this.vectorSearch(trimmed),
            this.textSearch(trimmed),
        ]);
        const fused = this.fuseRankings(vectorRanking, textRanking);
        if (fused.length === 0)
            return [];
        const versionIds = fused.map((f) => f.version_id);
        const articles = await this.articleRepository.findByVersionIds(versionIds);
        const articleByVersionId = new Map(articles.map((a) => [a.article_version_id, a]));
        const hits = [];
        for (const f of fused) {
            const article = articleByVersionId.get(f.version_id);
            if (!article)
                continue;
            if (!allowedStatuses.includes(article.article_status))
                continue;
            if (options.topicIds && options.topicIds.length > 0 && !options.topicIds.includes(article.topic_id))
                continue;
            hits.push({
                article,
                matched_chunk_preview: f.preview,
                score: f.score,
                vector_rank: f.vector_rank,
                text_rank: f.text_rank,
            });
            if (hits.length >= limit)
                break;
        }
        return hits;
    }
    // ─── Vector path ──────────────────────────────────────────────────────────────
    async vectorSearch(query) {
        await this.ensureCache();
        if (this.cache.length === 0)
            return [];
        const queryEmbedding = await (0, ai_service_1.getEmbedding)(query, 'query');
        const scored = this.cache.map((c) => ({
            version_id: c.version_id,
            chunk_id: c._id,
            preview: c.content.slice(0, PREVIEW_LENGTH),
            similarity: cosineSimilarity(queryEmbedding, c.embedding),
        }));
        scored.sort((a, b) => b.similarity - a.similarity);
        // Collapse to best chunk per version_id, then take top K.
        const seen = new Set();
        const best = [];
        for (const s of scored) {
            if (seen.has(s.version_id))
                continue;
            seen.add(s.version_id);
            best.push(s);
            if (best.length >= VECTOR_TOP_K)
                break;
        }
        return best;
    }
    // ─── Text path ────────────────────────────────────────────────────────────────
    async textSearch(query) {
        const col = (0, kb_collections_1.getArticlesCollection)((0, mongo_connection_1.getMongoDb)());
        const docs = await col
            .aggregate([
            { $match: { $text: { $search: query } } },
            { $addFields: { textScore: { $meta: 'textScore' } } },
            { $unwind: '$versions' },
            { $sort: { textScore: -1, 'versions.updatedAt': -1 } },
            { $limit: TEXT_TOP_K },
            { $project: { _id: 0, version_id: { $toString: '$versions._id' } } },
        ])
            .toArray();
        return docs.map((d) => ({ version_id: d['version_id'] }));
    }
    // ─── RRF fusion ───────────────────────────────────────────────────────────────
    fuseRankings(vec, text) {
        const scores = new Map();
        vec.forEach((v, i) => {
            const rank = i + 1;
            scores.set(v.version_id, {
                score: 1 / (RRF_K + rank),
                preview: v.preview,
                vector_rank: rank,
                text_rank: null,
            });
        });
        text.forEach((t, i) => {
            const rank = i + 1;
            const existing = scores.get(t.version_id);
            if (existing) {
                existing.score += 1 / (RRF_K + rank);
                existing.text_rank = rank;
            }
            else {
                scores.set(t.version_id, {
                    score: 1 / (RRF_K + rank),
                    preview: null,
                    vector_rank: null,
                    text_rank: rank,
                });
            }
        });
        return Array.from(scores.entries())
            .map(([version_id, v]) => ({ version_id, ...v }))
            .sort((a, b) => b.score - a.score);
    }
};
exports.ArticleSearchService = ArticleSearchService;
exports.ArticleSearchService = ArticleSearchService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleChunkRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleRepository)),
    __metadata("design:paramtypes", [Object, Object])
], ArticleSearchService);
// ─── Math ───────────────────────────────────────────────────────────────────────
function cosineSimilarity(a, b) {
    if (a.length !== b.length || a.length === 0)
        return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        const ai = a[i];
        const bi = b[i];
        dot += ai * bi;
        normA += ai * ai;
        normB += bi * bi;
    }
    if (normA === 0 || normB === 0)
        return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
//# sourceMappingURL=articleSearch.service.js.map