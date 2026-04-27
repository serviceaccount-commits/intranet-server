import {
  KbArticleVersionView,
  PaginatedArticlesResult,
  ArticleLockInfo,
  ArticleStatus,
} from '../../database/kb-domain.types';
import { FilterArticleInput } from '../../schema/articles/FilterArticleSchema';

export interface IArticleRepository {
  // ── Creation ────────────────────────────────────────────────────────────────

  /** Creates a new article document with its first embedded version. */
  createArticle(
    topicId: string,
    userId: string,
    articleName: string,
    content: string,
    updatedByName?: string | null,
  ): Promise<KbArticleVersionView>;

  /** Adds a new version to an existing article (found by any of its version IDs). */
  addVersion(
    existingVersionId: string,
    options: { useVersionAsTemplate: boolean; userId: string; updatedByName?: string | null },
  ): Promise<KbArticleVersionView>;

  // ── Reads ────────────────────────────────────────────────────────────────────

  /** Find the view for a specific version by its _id. */
  findByVersionId(versionId: string): Promise<KbArticleVersionView | null>;

  /** Find views for multiple version IDs. */
  findByVersionIds(versionIds: string[]): Promise<KbArticleVersionView[]>;

  /** All versions of the article that contains the given versionId. */
  findVersionsByVersionId(versionId: string): Promise<KbArticleVersionView[]>;

  /** Latest (highest version number) view for a topic — one per article. */
  findAllLatestByTopicId(topicId: string): Promise<KbArticleVersionView[]>;

  /** Recent articles for a set of topic IDs (dashboard). */
  findRecentByTopicIds(
    topicIds: string[],
    limit?: number,
  ): Promise<KbArticleVersionView[]>;

  // ── Paginated lists ──────────────────────────────────────────────────────────

  findAndCountByTopicId(
    topicId: string,
    filters: FilterArticleInput,
    canSeeDraft: boolean,
  ): Promise<PaginatedArticlesResult>;

  findAndCountByTopicIds(
    topicIds: string[],
    filters: FilterArticleInput,
    canSeeDraft: boolean,
  ): Promise<PaginatedArticlesResult>;

  findAndCount(
    filters: FilterArticleInput,
    canSeeDraft: boolean,
  ): Promise<PaginatedArticlesResult>;

  // ── Atomic field updates ─────────────────────────────────────────────────────

  updateVersionContent(
    versionId: string,
    content: string,
    updatedBy: string,
    updatedByName?: string | null,
  ): Promise<void>;

  updateVersionName(versionId: string, name: string): Promise<void>;

  updateVersionSynopsis(versionId: string, synopsis: string): Promise<void>;

  updateVersionStatus(
    versionId: string,
    status: ArticleStatus,
    publishedBy?: string,
  ): Promise<void>;

  updateVersionsStatus(versionIds: string[], status: ArticleStatus): Promise<void>;

  // ── Edit locks ───────────────────────────────────────────────────────────────

  acquireLock(versionId: string, userId: string, expiresAt: Date): Promise<void>;
  refreshLock(versionId: string, expiresAt: Date): Promise<void>;
  releaseLock(versionId: string): Promise<void>;
  releaseAllLocks(): Promise<void>;
  getLockInfo(versionId: string): Promise<ArticleLockInfo | null>;

  // ── Tags ─────────────────────────────────────────────────────────────────────

  addTagToVersion(versionId: string, tagId: string): Promise<void>;
  removeTagFromVersion(versionId: string, tagId: string): Promise<void>;

  // ── Bulk operations ──────────────────────────────────────────────────────────

  moveArticlesToTopic(versionIds: string[], topicId: string): Promise<void>;

  // ── Maintenance ──────────────────────────────────────────────────────────────

  clearExpiredLocks(): Promise<number>;

  // ── External client portal ───────────────────────────────────────────────────

  /** Returns published articles for the given topic IDs (available_for_client=true).
   *  Client/topic resolution must be done by the caller before invoking this. */
  findPublishedByTopicIds(
    topicIds: string[],
    filters: FilterArticleInput,
  ): Promise<KbArticleVersionView[]>;

  /** Returns a single published version for the given topic IDs.
   *  Client/topic resolution must be done by the caller before invoking this. */
  findPublishedVersionByTopicIds(
    topicIds: string[],
    versionId: string,
  ): Promise<KbArticleVersionView | null>;
}
