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
exports.ArticleChunkingService = void 0;
const inversify_1 = require("inversify");
const mongodb_1 = require("mongodb");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const chunker_1 = require("../../../../shared/utils/chunker");
const ai_service_1 = require("../../../../shared/utils/ai.service");
const logger_1 = require("../../../../shared/utils/logger");
const articleSearch_service_1 = require("./articleSearch.service");
let ArticleChunkingService = class ArticleChunkingService {
    chunkRepository;
    searchService;
    constructor(chunkRepository, searchService) {
        this.chunkRepository = chunkRepository;
        this.searchService = searchService;
    }
    /** Re-chunks the given HTML for a version, reusing embeddings whose
     *  content_hash already exists (either on this version or anywhere in the
     *  chunks collection). Embeds only what is genuinely new. */
    async processVersion(articleId, versionId, html) {
        const articleOid = new mongodb_1.ObjectId(articleId);
        const versionOid = new mongodb_1.ObjectId(versionId);
        const cleaned = (html ?? '').trim();
        if (!cleaned) {
            const removed = await this.chunkRepository.deleteByVersionId(versionOid);
            return { chunksCreated: 0, reusedFromCache: removed, newlyEmbedded: 0 };
        }
        const chunks = (0, chunker_1.chunkHtmlContent)(cleaned);
        if (chunks.length === 0) {
            const removed = await this.chunkRepository.deleteByVersionId(versionOid);
            return { chunksCreated: 0, reusedFromCache: removed, newlyEmbedded: 0 };
        }
        const hashes = chunks.map((c) => c.content_hash);
        const cached = await this.chunkRepository.findByContentHashes(hashes);
        const hashToEmbedding = new Map();
        for (const c of cached) {
            if (c.embedding_model === ai_service_1.EMBEDDING_MODEL && !hashToEmbedding.has(c.content_hash)) {
                hashToEmbedding.set(c.content_hash, c.embedding);
            }
        }
        let reused = 0;
        let embedded = 0;
        const toPersist = [];
        for (const chunk of chunks) {
            let embedding = hashToEmbedding.get(chunk.content_hash);
            if (embedding) {
                reused++;
            }
            else {
                embedding = await (0, ai_service_1.getEmbedding)(chunk.content, 'document');
                hashToEmbedding.set(chunk.content_hash, embedding);
                embedded++;
            }
            toPersist.push({
                chunk_index: chunk.chunk_index,
                content: chunk.content,
                content_hash: chunk.content_hash,
                token_count: chunk.token_count,
                embedding,
                embedding_model: ai_service_1.EMBEDDING_MODEL,
            });
        }
        await this.chunkRepository.replaceChunksForVersion(articleOid, versionOid, toPersist);
        this.searchService.invalidateCache();
        return {
            chunksCreated: toPersist.length,
            reusedFromCache: reused,
            newlyEmbedded: embedded,
        };
    }
    /** Wrapper for consumers (article create/update flows) that should never
     *  fail the parent operation if chunking fails. Errors are logged. */
    async processVersionSafe(articleId, versionId, html) {
        try {
            const result = await this.processVersion(articleId, versionId, html);
            logger_1.logger.info(`[chunking] version=${versionId} chunks=${result.chunksCreated} reused=${result.reusedFromCache} embedded=${result.newlyEmbedded}`);
        }
        catch (error) {
            logger_1.logger.error(`[chunking] failed for version=${versionId}`, error);
        }
    }
};
exports.ArticleChunkingService = ArticleChunkingService;
exports.ArticleChunkingService = ArticleChunkingService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleChunkRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleSearchService)),
    __metadata("design:paramtypes", [Object, articleSearch_service_1.ArticleSearchService])
], ArticleChunkingService);
//# sourceMappingURL=articleChunking.service.js.map