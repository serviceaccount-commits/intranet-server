"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationInputSchema = exports.UpdateArticleSynopsisInputSchema = exports.UpdateArticleNameInputSchema = exports.UpdateArticleContentInputSchema = exports.CreateArticleInputSchema = exports.KbArticleSchema = exports.KbArticleChunkSchema = exports.KbArticleVersionSchema = exports.CreateTagInputSchema = exports.KbTagSchema = exports.ArticleStatusEnum = void 0;
const zod_1 = require("zod");
const mongodb_1 = require("mongodb");
// ─── Enums ────────────────────────────────────────────────────────────────────
exports.ArticleStatusEnum = zod_1.z.enum([
    'draft',
    'published',
    'unpublished',
    'outdated',
    'archived',
]);
// ─── Tag ─────────────────────────────────────────────────────────────────────
exports.KbTagSchema = zod_1.z.object({
    _id: zod_1.z.instanceof(mongodb_1.ObjectId),
    tag_name: zod_1.z.string().min(1).max(100),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.CreateTagInputSchema = zod_1.z.object({
    tag_name: zod_1.z.string().min(1, 'Tag name is required').max(100).trim(),
});
// ─── Article Version (embedded inside Article) ────────────────────────────────
exports.KbArticleVersionSchema = zod_1.z.object({
    _id: zod_1.z.instanceof(mongodb_1.ObjectId),
    article_name: zod_1.z.string().min(0).max(500),
    article_synopsis: zod_1.z.string().max(2000),
    article_status: exports.ArticleStatusEnum,
    version: zod_1.z.number().int().positive(),
    // HTML content stored directly — replaces S3 + documents table
    content: zod_1.z.string(),
    // Plain text extracted from HTML — used for full-text search only, never rendered
    content_text: zod_1.z.string().optional(),
    // Storage backend — 'inline' = content is in this field, 's3'/'local' = content is a path/key
    content_storage: zod_1.z.enum(['inline', 's3', 'local']).default('inline'),
    // Tag references (ObjectId of tags collection)
    tag_ids: zod_1.z.array(zod_1.z.instanceof(mongodb_1.ObjectId)),
    // Cross-references to PostgreSQL users
    created_by: zod_1.z.string().uuid().nullable(),
    updated_by: zod_1.z.string().uuid().nullable(),
    updated_by_name: zod_1.z.string().nullable().optional(),
    published_by: zod_1.z.string().uuid().nullable(),
    published_at: zod_1.z.date().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// ─── Article Chunk (separate collection, one document per chunk) ──────────────
exports.KbArticleChunkSchema = zod_1.z.object({
    _id: zod_1.z.instanceof(mongodb_1.ObjectId),
    article_id: zod_1.z.instanceof(mongodb_1.ObjectId),
    version_id: zod_1.z.instanceof(mongodb_1.ObjectId),
    chunk_index: zod_1.z.number().int().nonnegative(),
    content: zod_1.z.string(),
    content_hash: zod_1.z.string().length(64), // sha256 hex
    token_count: zod_1.z.number().int().positive(),
    embedding: zod_1.z.array(zod_1.z.number()),
    embedding_model: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// ─── Article (root document) ─────────────────────────────────────────────────
exports.KbArticleSchema = zod_1.z.object({
    _id: zod_1.z.instanceof(mongodb_1.ObjectId),
    topic_id: zod_1.z.string().uuid(),
    // Cross-reference to PostgreSQL user (creator)
    user_id: zod_1.z.string().uuid().nullable(),
    // Edit lock
    locked_by_user_id: zod_1.z.string().uuid().nullable(),
    lock_expires_at: zod_1.z.date().nullable(),
    // External client visibility
    available_for_client: zod_1.z.boolean(),
    // Embedded versions array — all versions live here
    versions: zod_1.z.array(exports.KbArticleVersionSchema),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Input schemas for API requests
exports.CreateArticleInputSchema = zod_1.z.object({
    article_name: zod_1.z.string().min(1, 'Article name is required').max(500).trim(),
    content: zod_1.z.string().default(''),
    topic_id: zod_1.z.string(), // ObjectId string from the request
});
exports.UpdateArticleContentInputSchema = zod_1.z.object({
    content: zod_1.z.string(),
});
exports.UpdateArticleNameInputSchema = zod_1.z.object({
    article_name: zod_1.z.string().min(2, 'Article name must be at least 2 characters').max(500).trim(),
});
exports.UpdateArticleSynopsisInputSchema = zod_1.z.object({
    article_synopsis: zod_1.z.string().min(2, 'Synopsis too short').max(2000),
});
// ─── Pagination ───────────────────────────────────────────────────────────────
exports.PaginationInputSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    search: zod_1.z.string().trim().optional(),
    tagId: zod_1.z.string().optional(),
    status: exports.ArticleStatusEnum.optional(),
});
//# sourceMappingURL=kb-domain.types.js.map