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

// ─── Article (root document) ─────────────────────────────────────────────────

export const KbArticleSchema = z.object({
  _id: z.instanceof(ObjectId),
  topic_id: z.string().uuid(),
  // Cross-reference to PostgreSQL user (creator)
  user_id: z.string().uuid().nullable(),
  // Edit lock
  locked_by_user_id: z.string().uuid().nullable(),
  lock_expires_at: z.date().nullable(),
  // External client visibility
  available_for_client: z.boolean(),
  // Embedded versions array — all versions live here
  versions: z.array(KbArticleVersionSchema),
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
  user_id: string | null;
  createdAt: Date;
  updatedAt: Date;
}
