import { z } from 'zod';
import { ObjectId } from 'mongodb';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const ArticleStatusEnum = z.enum([
  'draft',
  'published',
  'unpublished',
  'outdated',
  'archived',
]);
export type ArticleStatus = z.infer<typeof ArticleStatusEnum>;

// Which audience a chunk (and its embedding) belongs to. Internal version
// chunks power the intranet search; client-copy chunks power the external /
// portal search. Kept separate so internal language never leaks into client
// search results.
export const ChunkAudienceEnum = z.enum(['internal', 'client']);
export type ChunkAudience = z.infer<typeof ChunkAudienceEnum>;

// Ownership/property classification of an article (staff-assigned in the
// intranet, shown as a column in the intranet + client portal lists):
//  - 'paricus'             → generic Paricus content (default for legacy + new
//                            intranet-created articles).
//  - 'client_owned'        → Paricus created it on behalf of the client whose KB
//                            it lives in.
//  - 'client_self_created' → the client created it themselves from the portal
//                            (auto-assigned server-side on managed create).
export const ArticlePropertyEnum = z.enum([
  'paricus',
  'client_owned',
  'client_self_created',
]);
export type ArticleProperty = z.infer<typeof ArticlePropertyEnum>;

// ─── Tag ─────────────────────────────────────────────────────────────────────

export const KbTagSchema = z.object({
  _id: z.instanceof(ObjectId),
  tag_name: z.string().min(1).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KbTag = z.infer<typeof KbTagSchema>;

export const CreateTagInputSchema = z.object({
  tag_name: z.string().min(1, 'Tag name is required').max(100).trim(),
});
export type CreateTagInput = z.infer<typeof CreateTagInputSchema>;

// ─── Article Version (embedded inside Article) ────────────────────────────────

export const KbArticleVersionSchema = z.object({
  _id: z.instanceof(ObjectId),
  article_name: z.string().min(0).max(500),
  article_synopsis: z.string().max(2000),
  article_status: ArticleStatusEnum,
  version: z.number().int().positive(),
  // HTML content stored directly — replaces S3 + documents table
  content: z.string(),
  // Plain text extracted from HTML — used for full-text search only, never rendered
  content_text: z.string().optional(),
  // Storage backend — 'inline' = content is in this field, 's3'/'local' = content is a path/key
  content_storage: z.enum(['inline', 's3', 'local']).default('inline'),
  // Tag references (ObjectId of tags collection)
  tag_ids: z.array(z.instanceof(ObjectId)),
  // Cross-references to PostgreSQL users
  created_by: z.string().uuid().nullable(),
  updated_by: z.string().uuid().nullable(),
  updated_by_name: z.string().nullable().optional(),
  published_by: z.string().uuid().nullable(),
  published_at: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KbArticleVersion = z.infer<typeof KbArticleVersionSchema>;

// ─── Client copy (embedded inside Article, single editable copy) ──────────────

/**
 * The client-facing copy of an article. Seeded from the first internal version
 * when the article is created, then edited INDEPENDENTLY (internal edits never
 * touch it). The client only ever sees this copy — never the internal versions.
 * There is at most one per article and it has no version history by design.
 */
export const KbClientCopySchema = z.object({
  _id: z.instanceof(ObjectId),
  article_name: z.string().min(0).max(500),
  article_synopsis: z.string().max(2000),
  content: z.string(),
  content_text: z.string().optional(),
  content_storage: z.enum(['inline', 's3', 'local']).default('inline'),
  updated_by: z.string().uuid().nullable(),
  updated_by_name: z.string().nullable().optional(),
  // Which internal version this copy was last seeded/regenerated from.
  seeded_from_version_id: z.instanceof(ObjectId).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KbClientCopy = z.infer<typeof KbClientCopySchema>;

// ─── Article Chunk (separate collection, one document per chunk) ──────────────

export const KbArticleChunkSchema = z.object({
  _id: z.instanceof(ObjectId),
  article_id: z.instanceof(ObjectId),
  version_id: z.instanceof(ObjectId),
  chunk_index: z.number().int().nonnegative(),
  content: z.string(),
  content_hash: z.string().length(64), // sha256 hex
  token_count: z.number().int().positive(),
  embedding: z.array(z.number()),
  embedding_model: z.string(),
  // 'internal' = chunk of an internal version (intranet search); 'client' =
  // chunk of the client copy (external/portal search). Defaults to 'internal'
  // for backward compatibility with chunks written before dual-view.
  audience: ChunkAudienceEnum.default('internal'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KbArticleChunk = z.infer<typeof KbArticleChunkSchema>;

// ─── Article (root document) ─────────────────────────────────────────────────

export const KbArticleSchema = z.object({
  _id: z.instanceof(ObjectId),
  topic_id: z.string().uuid(),
  // Cross-reference to PostgreSQL user (creator)
  user_id: z.string().uuid().nullable(),
  // Edit lock
  locked_by_user_id: z.string().uuid().nullable(),
  lock_expires_at: z.date().nullable(),
  // External client visibility — now governs the client copy's exposure
  available_for_client: z.boolean(),
  // Marks the article as available for future chatbot/AI consumption. Has no
  // effect on any current behavior — persisted only. Defaults false for docs
  // created before this flag existed.
  available_for_ai: z.boolean().default(false),
  // Ownership classification. Defaults to 'paricus' for docs created before this
  // field existed (legacy backfill) and for new intranet-created articles.
  article_property: ArticlePropertyEnum.default('paricus'),
  // Embedded versions array — all INTERNAL versions live here
  versions: z.array(KbArticleVersionSchema),
  // The single client-facing copy (seeded on create, edited independently).
  // Nullable/optional for documents created before dual-view (backfilled).
  client_copy: KbClientCopySchema.nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KbArticle = z.infer<typeof KbArticleSchema>;

// Input schemas for API requests

export const CreateArticleInputSchema = z.object({
  article_name: z.string().min(1, 'Article name is required').max(500).trim(),
  content: z.string().default(''),
  topic_id: z.string(), // ObjectId string from the request
});
export type CreateArticleInput = z.infer<typeof CreateArticleInputSchema>;

export const UpdateArticleContentInputSchema = z.object({
  content: z.string(),
});
export type UpdateArticleContentInput = z.infer<typeof UpdateArticleContentInputSchema>;

export const UpdateArticleNameInputSchema = z.object({
  article_name: z.string().min(2, 'Article name must be at least 2 characters').max(500).trim(),
});
export type UpdateArticleNameInput = z.infer<typeof UpdateArticleNameInputSchema>;

export const UpdateArticleSynopsisInputSchema = z.object({
  article_synopsis: z.string().min(2, 'Synopsis too short').max(2000),
});
export type UpdateArticleSynopsisInput = z.infer<typeof UpdateArticleSynopsisInputSchema>;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PaginationInputSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  tagId: z.string().optional(),
  status: ArticleStatusEnum.optional(),
});
export type PaginationInput = z.infer<typeof PaginationInputSchema>;

// ─── Serialized API views (ObjectId → string, safe for JSON) ──────────────────

/**
 * Flat view returned by the API — combines KbArticle root fields + one
 * KbArticleVersion. All ObjectIds are serialized to strings.
 */
export interface KbArticleVersionView {
  // Article-root fields
  article_id: string;
  topic_id: string;
  user_id: string | null;
  locked_by_user_id: string | null;
  lock_expires_at: Date | null;
  available_for_client: boolean;
  available_for_ai: boolean;
  article_property: ArticleProperty;
  // Version fields
  article_version_id: string;
  article_name: string;
  article_synopsis: string;
  article_status: ArticleStatus;
  version: number;
  content: string;
  content_storage: 'inline' | 's3' | 'local';
  tag_ids: string[];
  created_by: string | null;
  updated_by: string | null;
  updated_by_name: string | null;
  published_by: string | null;
  published_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Flat, serializable view of an article's client copy. `client_copy_id` is the
 * id the external/portal API exposes as the article id (so the client never
 * sees an internal version id).
 */
export interface KbClientCopyView {
  article_id: string;
  topic_id: string;
  available_for_client: boolean;
  article_property: ArticleProperty;
  client_copy_id: string;
  article_name: string;
  article_synopsis: string;
  content: string;
  updated_by: string | null;
  updated_by_name: string | null;
  seeded_from_version_id: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedArticlesResult {
  articles: KbArticleVersionView[];
  total: number;
}

export interface ArticleLockInfo {
  locked_by_user_id: string | null;
  lock_expires_at: Date | null;
}

// ─── Client (KB-facing plain type, keeps PostgreSQL-backed implementation) ─────

export interface KbClient {
  client_id: string;
  client_shared_id: string;
  client_name: string;
  client_edit_available: boolean;
  region: string;
  entity: string;
  is_im: boolean;
  is_flx: boolean;
  user_id: string | null;
  address: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedKbClientResult {
  clients: KbClient[];
  total: number;
}

// ─── Topic (KB-facing plain type, keeps PostgreSQL-backed implementation) ──────

export interface KbTopic {
  topic_id: string;
  topic_name: string;
  topic_edit_available: boolean;
  client_id: string;
  /** Self-reference for folder hierarchy. NULL = root folder of the client. */
  parent_topic_id: string | null;
  user_id: string | null;
  createdAt: Date;
  updatedAt: Date;
}
