import {
  KbArticleVersionView,
  PaginatedArticlesResult,
  ArticleLockInfo,
  KbTag,
  KbTopic,
} from '../../database/kb-domain.types';
import { CreateVersionInput } from '../../schema/articles/CreateVersionSchema';
import { FilterArticleInput } from '../../schema/articles/FilterArticleSchema';
import { MoveArticleInput } from '../../schema/clients/MoveArticleSchema';

export interface ExternalClientArticle {
  article_id: string;
  article_name: string;
  article_synopsis: string;
  updated_at: Date;
  /** Relevance score from the hybrid search service. Present only on
   *  search responses; consumers can sort by this descending. */
  _score?: number;
}

export interface ExternalClientArticleDetail {
  article: ExternalClientArticle;
  content: string;
}

export interface IArticleService {
  // ── Create ───────────────────────────────────────────────────────────────────
  createArticle(
    articleName: string,
    content: string,
    topicId: string,
    userId: string,
  ): Promise<KbArticleVersionView>;

  createVersion(
    input: CreateVersionInput,
    userId: string,
  ): Promise<KbArticleVersionView>;

  // ── Content updates ──────────────────────────────────────────────────────────
  updateArticleContent(
    versionId: string,
    content: string,
    userId: string,
  ): Promise<void>;

  updateArticleName(versionId: string, articleName: string): Promise<void>;

  updateArticleSynopsis(versionId: string, synopsis: string): Promise<void>;

  generateAISynopsis(versionId: string): Promise<string>;

  // ── Edit lock ────────────────────────────────────────────────────────────────
  startArticleEdit(userId: string, versionId: string): Promise<void>;
  refreshEditLock(userId: string, versionId: string): Promise<void>;
  closeArticleEdit(userId: string, versionId: string): Promise<void>;
  releaseAllArticleLocks(): Promise<void>;
  getArticleLockInfo(versionId: string): Promise<ArticleLockInfo>;

  // ── Tags ─────────────────────────────────────────────────────────────────────
  addTagToArticle(versionId: string, tagName: string): Promise<KbTag>;
  removeTagFromArticle(versionId: string, tagId: string): Promise<void>;

  // ── Queries ──────────────────────────────────────────────────────────────────
  getArticles(topicId: string): Promise<KbArticleVersionView[]>;
  findLatestArticlesByUserId(userId: string): Promise<KbArticleVersionView[]>;

  findArticles(
    filters: FilterArticleInput,
    userId: string,
  ): Promise<PaginatedArticlesResult>;

  findArticlesByClientId(
    clientId: string,
    filters: FilterArticleInput,
    userId: string,
  ): Promise<PaginatedArticlesResult>;

  findArticlesByTopicId(
    topicId: string,
    filters: FilterArticleInput,
    userId: string,
  ): Promise<PaginatedArticlesResult>;

  getArticleById(versionId: string): Promise<KbArticleVersionView>;
  getArticleWithDetails(versionId: string): Promise<{
    article: {
      article_version_id: string;
      article_name: string;
      article_synopsis: string;
      article_status: string;
      version: number;
      locked_by_user_id: string | null;
      lock_expires_at: Date | null;
      createdAt: Date;
      updatedAt: Date;
      published_at: Date | null;
      tags: { tag_id: string; tag_name: string }[];
      user: { first_name: string; last_name: string } | null;
      user_update: { first_name: string; last_name: string } | null;
      user_publish: { first_name: string; last_name: string } | null;
      article: { article_id: string; topic: { topic_id: string; topic_name: string; client_id: string }; user_id: string | null };
    };
    available_for_client: boolean;
  }>;
  getArticleDocumentById(versionId: string): Promise<string>;

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  moveArticleToTopic(input: MoveArticleInput, userId: string): Promise<void>;

  getArticleVersionsByArticleVersionId(
    versionId: string,
  ): Promise<KbArticleVersionView[]>;

  publishVersion(versionId: string): Promise<KbArticleVersionView>;
  unpublishVersion(versionId: string): Promise<KbArticleVersionView>;
  publishVersions(versionIds: string[]): Promise<void>;
  unpublishVersions(versionIds: string[]): Promise<void>;

  // ── External client ──────────────────────────────────────────────────────────
  findSharedArticlesByClientSharedId(
    filters: FilterArticleInput,
    clientSharedId: string,
    topicId?: string,
  ): Promise<ExternalClientArticle[]>;

  getArticleByExternalClientAndArticleId(
    clientSharedId: string,
    versionId: string,
  ): Promise<ExternalClientArticleDetail>;

  /** Topics belonging to a client (with parent_topic_id) so the portal sidebar
   *  can build the folder tree. Available to both client and admin keys. */
  getTopicsBySharedClientId(clientSharedId: string): Promise<KbTopic[]>;

  // ── Admin (ignores available_for_client flag) ────────────────────────────────
  findAllPublishedByClientSharedId(
    filters: FilterArticleInput,
    clientSharedId: string,
    topicId?: string,
  ): Promise<ExternalClientArticle[]>;

  getArticleByExternalClientAndArticleIdAdmin(
    clientSharedId: string,
    versionId: string,
  ): Promise<ExternalClientArticleDetail>;

  reindexAllPublishedChunks(
    clientSharedId?: string,
  ): Promise<{ processed: number; failed: number; skipped: number }>;
}
