"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleChunkRepository = void 0;
const inversify_1 = require("inversify");
const mongodb_1 = require("mongodb");
const kb_collections_1 = require("../database/kb-collections");
const mongo_connection_1 = require("../../../../shared/database/mongo-connection");
let ArticleChunkRepository = class ArticleChunkRepository {
    get col() {
        return (0, kb_collections_1.getArticleChunksCollection)((0, mongo_connection_1.getMongoDb)());
    }
    async replaceChunksForVersion(articleId, versionId, chunks) {
        await this.col.deleteMany({ version_id: versionId });
        if (chunks.length === 0)
            return;
        const now = new Date();
        const docs = chunks.map((c) => ({
            _id: new mongodb_1.ObjectId(),
            article_id: articleId,
            version_id: versionId,
            chunk_index: c.chunk_index,
            content: c.content,
            content_hash: c.content_hash,
            token_count: c.token_count,
            embedding: c.embedding,
            embedding_model: c.embedding_model,
            createdAt: now,
            updatedAt: now,
        }));
        await this.col.insertMany(docs);
    }
    async findByContentHashes(hashes) {
        if (hashes.length === 0)
            return [];
        return this.col.find({ content_hash: { $in: hashes } }).toArray();
    }
    async findByVersionId(versionId) {
        return this.col
            .find({ version_id: versionId })
            .sort({ chunk_index: 1 })
            .toArray();
    }
    async loadAllForSearch() {
        const docs = await this.col
            .find({}, { projection: { content: 1, embedding: 1, article_id: 1, version_id: 1, chunk_index: 1 } })
            .toArray();
        return docs.map((d) => ({
            _id: d._id.toString(),
            article_id: d.article_id.toString(),
            version_id: d.version_id.toString(),
            chunk_index: d.chunk_index,
            content: d.content,
            embedding: d.embedding,
        }));
    }
    async deleteByVersionId(versionId) {
        const result = await this.col.deleteMany({ version_id: versionId });
        return result.deletedCount;
    }
    async deleteByArticleId(articleId) {
        const result = await this.col.deleteMany({ article_id: articleId });
        return result.deletedCount;
    }
};
exports.ArticleChunkRepository = ArticleChunkRepository;
exports.ArticleChunkRepository = ArticleChunkRepository = __decorate([
    (0, inversify_1.injectable)()
], ArticleChunkRepository);
//# sourceMappingURL=articleChunk.repository.js.map