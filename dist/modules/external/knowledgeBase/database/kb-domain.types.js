"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationInputSchema = exports.UpdateArticleSynopsisInputSchema = exports.UpdateArticleNameInputSchema = exports.UpdateArticleContentInputSchema = exports.CreateArticleInputSchema = exports.KbArticleSchema = exports.KbArticleChunkSchema = exports.KbClientCopySchema = exports.KbArticleVersionSchema = exports.CreateTagInputSchema = exports.KbTagSchema = exports.ArticlePropertyEnum = exports.ChunkAudienceEnum = exports.ArticleStatusEnum = void 0;
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
// Which audience a chunk (and its embedding) belongs to. Internal version
// chunks power the intranet search; client-copy chunks power the external /
// portal search. Kept separate so internal language never leaks into client
// search results.
exports.ChunkAudienceEnum = zod_1.z.enum(['internal', 'client']);
// Ownership/property classification of an article (staff-assigned in the
// intranet, shown as a column in the intranet + client portal lists):
//  - 'paricus'             → generic Paricus content (default for legacy + new
//                            intranet-created articles).
//  - 'client_owned'        → Paricus created it on behalf of the client whose KB
//                            it lives in.
//  - 'client_self_created' → the client created it themselves from the portal
//                            (auto-assigned server-side on managed create).
exports.ArticlePropertyEnum = zod_1.z.enum([
    'paricus',
    'client_owned',
    'client_self_created',
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
// ─── Client copy (embedded inside Article, single editable copy) ──────────────
/**
 * The client-facing copy of an article. Seeded from the first internal version
 * when the article is created, then edited INDEPENDENTLY (internal edits never
 * touch it). The client only ever sees this copy — never the internal versions.
 * There is at most one per article and it has no version history by design.
 */
exports.KbClientCopySchema = zod_1.z.object({
    _id: zod_1.z.instanceof(mongodb_1.ObjectId),
    article_name: zod_1.z.string().min(0).max(500),
    article_synopsis: zod_1.z.string().max(2000),
    content: zod_1.z.string(),
    content_text: zod_1.z.string().optional(),
    content_storage: zod_1.z.enum(['inline', 's3', 'local']).default('inline'),
    updated_by: zod_1.z.string().uuid().nullable(),
    updated_by_name: zod_1.z.string().nullable().optional(),
    // Which internal version this copy was last seeded/regenerated from.
    seeded_from_version_id: zod_1.z.instanceof(mongodb_1.ObjectId).nullable(),
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
    // 'internal' = chunk of an internal version (intranet search); 'client' =
    // chunk of the client copy (external/portal search). Defaults to 'internal'
    // for backward compatibility with chunks written before dual-view.
    audience: exports.ChunkAudienceEnum.default('internal'),
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
    // External client visibility — now governs the client copy's exposure
    available_for_client: zod_1.z.boolean(),
    // Marks the article as available for future chatbot/AI consumption. Has no
    // effect on any current behavior — persisted only. Defaults false for docs
    // created before this flag existed.
    available_for_ai: zod_1.z.boolean().default(false),
    // Ownership classification. Defaults to 'paricus' for docs created before this
    // field existed (legacy backfill) and for new intranet-created articles.
    article_property: exports.ArticlePropertyEnum.default('paricus'),
    // Embedded versions array — all INTERNAL versions live here
    versions: zod_1.z.array(exports.KbArticleVersionSchema),
    // The single client-facing copy (seeded on create, edited independently).
    // Nullable/optional for documents created before dual-view (backfilled).
    client_copy: exports.KbClientCopySchema.nullable().optional(),
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