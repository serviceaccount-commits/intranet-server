import { injectable } from 'inversify';
import { ObjectId, UpdateFilter } from 'mongodb';
import * as cheerio from 'cheerio';

import {
  IArticleRepository,
} from '../interfaces/articles/article.repository.interface';
import {
  KbArticle,
  KbArticleVersion,
  KbArticleVersionView,
  KbClientCopy,
  KbClientCopyView,
  PaginatedArticlesResult,
  ArticleLockInfo,
  ArticleStatus,
  ArticleProperty,
} from '../database/kb-domain.types';
import { getArticlesCollection } from '../database/kb-collections';
import { getMongoDb } from '../../../../shared/database/mongo-connection';
import { FilterArticleInput } from '../schema/articles/FilterArticleSchema';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

@injectable()
export class ArticleRepository implements IArticleRepository {
  private get col() {
    return getArticlesCollection(getMongoDb());
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private htmlToText(html: string): string {
    const $ = cheerio.load(html);
    return $.root().text().replace(/\s+/g, ' ').trim();
  }

  /** Converts a KbArticle root + one of its versions into a flat, serializable view. */
  private toView(article: KbArticle, version: KbArticleVersion): KbArticleVersionView {
    return {
      article_id: article._id.toString(),
      topic_id: article.topic_id,
      user_id: article.user_id,
      locked_by_user_id: article.locked_by_user_id,
      lock_expires_at: article.lock_expires_at,
      available_for_client: article.available_for_client,
      available_for_ai: article.available_for_ai ?? false,
      article_property: article.article_property ?? 'paricus',
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
  private buildVersionFilterStages(
    filters: FilterArticleInput,
    canSeeDraft: boolean,
    forceStatus?: ArticleStatus,
  ) {
    const { tagId } = filters;

    const allowedStatuses: ArticleStatus[] = ['published', 'unpublished', 'outdated', 'archived'];
    if (canSeeDraft) allowedStatuses.push('draft');

    const stages: Record<string, unknown>[] = [
      { $unwind: '$versions' },
      {
        $addFields: {
          'versions.article_id': '$_id',
          'versions.topic_id_root': '$topic_id',
          'versions.user_id_root': '$user_id',
          'versions.locked_by_user_id': '$locked_by_user_id',
          'versions.lock_expires_at': '$lock_expires_at',
          'versions.available_for_client': '$available_for_client',
          'versions.available_for_ai': '$available_for_ai',
          'versions.article_property': '$article_property',
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
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));
    if (validTagOids.length > 0) {
      stages.push({ $match: { 'versions.tag_ids': { $in: validTagOids } } });
    }

    return stages;
  }

  /** Flattens an article root + its client copy into a serializable view. */
  private toClientCopyView(article: KbArticle, copy: KbClientCopy): KbClientCopyView {
    return {
      article_id: article._id.toString(),
      topic_id: article.topic_id,
      available_for_client: article.available_for_client,
      article_property: article.article_property ?? 'paricus',
      client_copy_id: copy._id.toString(),
      article_name: copy.article_name,
      article_synopsis: copy.article_synopsis,
      content: copy.content,
      updated_by: copy.updated_by,
      updated_by_name: copy.updated_by_name ?? null,
      seeded_from_version_id: copy.seeded_from_version_id
        ? copy.seeded_from_version_id.toString()
        : null,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }

  /** Maps an aggregation result (after $unwind + $addFields) back to a view. */
  private aggDocToView(doc: Record<string, unknown>): KbArticleVersionView {
    const v = doc['versions'] as Record<string, unknown>;
    return {
      article_id: (v['article_id'] as ObjectId).toString(),
      topic_id: v['topic_id_root'] as string,
      user_id: (v['user_id_root'] as string | null) ?? null,
      locked_by_user_id: (v['locked_by_user_id'] as string | null) ?? null,
      lock_expires_at: (v['lock_expires_at'] as Date | null) ?? null,
      available_for_client: v['available_for_client'] as boolean,
      available_for_ai: (v['available_for_ai'] as boolean) ?? false,
      article_property: (v['article_property'] as ArticleProperty) ?? 'paricus',
      article_version_id: (v['_id'] as ObjectId).toString(),
      article_name: v['article_name'] as string,
      article_synopsis: v['article_synopsis'] as string,
      article_status: v['article_status'] as ArticleStatus,
      version: v['version'] as number,
      content: (v['content'] as string) ?? '',
      content_storage: (v['content_storage'] as 'inline' | 's3' | 'local') ?? 'inline',
      tag_ids: ((v['tag_ids'] as ObjectId[]) ?? []).map((id) => id.toString()),
      created_by: (v['created_by'] as string | null) ?? null,
      updated_by: (v['updated_by'] as string | null) ?? null,
      updated_by_name: (v['updated_by_name'] as string | null) ?? null,
      published_by: (v['published_by'] as string | null) ?? null,
      published_at: (v['published_at'] as Date | null) ?? null,
      createdAt: v['createdAt'] as Date,
      updatedAt: v['updatedAt'] as Date,
    };
  }

  // ─── Creation ─────────────────────────────────────────────────────────────────

  async createArticle(
    topicId: string,
    userId: string,
    articleName: string,
    content: string,
    updatedByName: string | null = null,
  ): Promise<KbArticleVersionView> {
    const now = new Date();
    const articleId = new ObjectId();
    const versionId = new ObjectId();

    const firstVersion: KbArticleVersion = {
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

    // Saving the first draft also generates the client-facing copy, seeded
    // from this version. It is then edited independently of the internal track.
    const clientCopy: KbClientCopy = {
      _id: new ObjectId(),
      article_name: articleName,
      article_synopsis: '',
      content,
      content_text: this.htmlToText(content),
      content_storage: 'inline',
      updated_by: userId,
      updated_by_name: updatedByName,
      seeded_from_version_id: versionId,
      createdAt: now,
      updatedAt: now,
    };

    const doc: KbArticle = {
      _id: articleId,
      topic_id: topicId,
      user_id: userId,
      locked_by_user_id: null,
      lock_expires_at: null,
      available_for_client: false,
      available_for_ai: false,
      article_property: 'paricus',
      versions: [firstVersion],
      client_copy: clientCopy,
      createdAt: now,
      updatedAt: now,
    };

    await this.col.insertOne(doc);
    return this.toView(doc, firstVersion);
  }

  async addVersion(
    existingVersionId: string,
    options: { useVersionAsTemplate: boolean; userId: string; updatedByName?: string | null },
  ): Promise<KbArticleVersionView> {
    if (!ObjectId.isValid(existingVersionId)) {
      throw new NotFoundError('Version', existingVersionId);
    }
    const vOid = new ObjectId(existingVersionId);

    const article = await this.col.findOne({ 'versions._id': vOid });
    if (!article) throw new NotFoundError('Article', existingVersionId);

    const templateVersion = article.versions.find((v) => v._id.equals(vOid));
    if (!templateVersion) throw new NotFoundError('Version', existingVersionId);

    const latestVersionNumber =
      article.versions.length > 0
        ? Math.max(...article.versions.map((v) => v.version))
        : 0;

    const now = new Date();
    const newVersionId = new ObjectId();
    const newVersion: KbArticleVersion = {
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

    await this.col.updateOne(
      { _id: article._id },
      { $push: { versions: newVersion }, $set: { updatedAt: now } } as UpdateFilter<KbArticle>,
    );

    return this.toView(article, newVersion);
  }

  // ─── Reads ────────────────────────────────────────────────────────────────────

  async findByVersionId(versionId: string): Promise<KbArticleVersionView | null> {
    if (!ObjectId.isValid(versionId)) return null;
    const vOid = new ObjectId(versionId);

    const article = await this.col.findOne({ 'versions._id': vOid });
    if (!article) return null;

    const version = article.versions.find((v) => v._id.equals(vOid));
    if (!version) return null;

    return this.toView(article, version);
  }

  async findByVersionIds(versionIds: string[]): Promise<KbArticleVersionView[]> {
    const oids = versionIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));
    if (oids.length === 0) return [];

    const articles = await this.col
      .find({ 'versions._id': { $in: oids } })
      .toArray();

    const views: KbArticleVersionView[] = [];
    for (const article of articles) {
      for (const oid of oids) {
        const version = article.versions.find((v) => v._id.equals(oid));
        if (version) views.push(this.toView(article, version));
      }
    }
    return views;
  }

  async findVersionsByVersionId(versionId: string): Promise<KbArticleVersionView[]> {
    if (!ObjectId.isValid(versionId)) return [];
    const vOid = new ObjectId(versionId);

    const article = await this.col.findOne({ 'versions._id': vOid });
    if (!article) return [];

    return article.versions
      .sort((a, b) => b.version - a.version)
      .map((v) => this.toView(article, v));
  }

  async findAllLatestByTopicId(topicId: string): Promise<KbArticleVersionView[]> {
    const articles = await this.col
      .find({ topic_id: topicId })
      .sort({ updatedAt: -1 })
      .toArray();

    return articles
      .filter((article) => article.versions.length > 0)
      .map((article) => {
        const latest = article.versions.reduce((max, v) =>
          v.version > max.version ? v : max,
        );
        return this.toView(article, latest);
      });
  }

  async findRecentByTopicIds(
    topicIds: string[],
    limit = 10,
  ): Promise<KbArticleVersionView[]> {
    if (topicIds.length === 0) return [];

    const articles = await this.col
      .find({ topic_id: { $in: topicIds } })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();

    return articles
      .filter((article) => article.versions.length > 0)
      .map((article) => {
        const latest = article.versions.reduce((max, v) =>
          v.version > max.version ? v : max,
        );
        return this.toView(article, latest);
      });
  }

  // ─── Paginated lists ──────────────────────────────────────────────────────────

  async findAndCountByTopicId(
    topicId: string,
    filters: FilterArticleInput,
    canSeeDraft: boolean,
  ): Promise<PaginatedArticlesResult> {
    const { search, page = 1, limit = 20 } = filters;

    const matchStages: Record<string, unknown>[] = [
      ...(search ? [{ $match: { $text: { $search: search } } }] : []),
      { $match: { topic_id: topicId } },
    ];

    return this.paginateVersionPipeline(matchStages, filters, canSeeDraft, page, limit);
  }

  async findAndCountByTopicIds(
    topicIds: string[],
    filters: FilterArticleInput,
    canSeeDraft: boolean,
  ): Promise<PaginatedArticlesResult> {
    if (topicIds.length === 0) return { articles: [], total: 0 };

    const { search, page = 1, limit = 20 } = filters;
    const matchStages: Record<string, unknown>[] = [
      ...(search ? [{ $match: { $text: { $search: search } } }] : []),
      { $match: { topic_id: { $in: topicIds } } },
    ];

    return this.paginateVersionPipeline(matchStages, filters, canSeeDraft, page, limit);
  }

  async findAndCount(
    filters: FilterArticleInput,
    canSeeDraft: boolean,
  ): Promise<PaginatedArticlesResult> {
    const { search, page = 1, limit = 20 } = filters;
    const matchStages: Record<string, unknown>[] = [
      ...(search ? [{ $match: { $text: { $search: search } } }] : []),
    ];

    return this.paginateVersionPipeline(matchStages, filters, canSeeDraft, page, limit);
  }

  /** Shared pagination helper for all findAndCount* methods. */
  private async paginateVersionPipeline(
    preMatchStages: Record<string, unknown>[],
    filters: FilterArticleInput,
    canSeeDraft: boolean,
    page: number,
    limit: number,
  ): Promise<PaginatedArticlesResult> {
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

    const total = (countResult[0] as { total?: number } | undefined)?.total ?? 0;
    const articles = docs.map((d) => this.aggDocToView(d as Record<string, unknown>));

    return { articles, total };
  }

  // ─── Atomic updates ───────────────────────────────────────────────────────────

  async updateVersionContent(
    versionId: string,
    content: string,
    updatedBy: string,
    updatedByName: string | null = null,
  ): Promise<void> {
    if (!ObjectId.isValid(versionId)) throw new NotFoundError('Version', versionId);
    const now = new Date();
    await this.col.updateOne(
      { 'versions._id': new ObjectId(versionId) },
      {
        $set: {
          'versions.$.content': content,
          'versions.$.content_text': this.htmlToText(content),
          'versions.$.updated_by': updatedBy,
          'versions.$.updated_by_name': updatedByName,
          'versions.$.updatedAt': now,
          updatedAt: now,
        },
      },
    );
  }

  async updateVersionName(versionId: string, name: string): Promise<void> {
    if (!ObjectId.isValid(versionId)) throw new NotFoundError('Version', versionId);
    const now = new Date();
    await this.col.updateOne(
      { 'versions._id': new ObjectId(versionId) },
      {
        $set: {
          'versions.$.article_name': name,
          'versions.$.updatedAt': now,
          updatedAt: now,
        },
      },
    );
  }

  async updateVersionSynopsis(versionId: string, synopsis: string): Promise<void> {
    if (!ObjectId.isValid(versionId)) throw new NotFoundError('Version', versionId);
    const now = new Date();
    await this.col.updateOne(
      { 'versions._id': new ObjectId(versionId) },
      {
        $set: {
          'versions.$.article_synopsis': synopsis,
          'versions.$.updatedAt': now,
          updatedAt: now,
        },
      },
    );
  }

  async updateVersionStatus(
    versionId: string,
    status: ArticleStatus,
    publishedBy?: string,
  ): Promise<void> {
    if (!ObjectId.isValid(versionId)) throw new NotFoundError('Version', versionId);
    const now = new Date();
    const setFields: Record<string, unknown> = {
      'versions.$.article_status': status,
      'versions.$.updatedAt': now,
      updatedAt: now,
    };
    if (status === 'published') {
      setFields['versions.$.published_at'] = now;
      if (publishedBy) setFields['versions.$.published_by'] = publishedBy;
    }
    await this.col.updateOne(
      { 'versions._id': new ObjectId(versionId) },
      { $set: setFields },
    );
  }

  async updateVersionsStatus(versionIds: string[], status: ArticleStatus): Promise<void> {
    const oids = versionIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));
    if (oids.length === 0) return;

    const now = new Date();
    await this.col.updateMany(
      { 'versions._id': { $in: oids } },
      {
        $set: {
          'versions.$[elem].article_status': status,
          'versions.$[elem].updatedAt': now,
          updatedAt: now,
        },
      },
      { arrayFilters: [{ 'elem._id': { $in: oids } }] },
    );
  }

  async setAvailableForClient(versionId: string, available: boolean): Promise<void> {
    if (!ObjectId.isValid(versionId)) throw new NotFoundError('Version', versionId);
    // Root-level article field (not per-version), so no positional operator.
    await this.col.updateOne(
      { 'versions._id': new ObjectId(versionId) },
      { $set: { available_for_client: available, updatedAt: new Date() } },
    );
  }

  async setAvailableForClientByArticleId(articleId: string, available: boolean): Promise<void> {
    if (!ObjectId.isValid(articleId)) throw new NotFoundError('Article', articleId);
    await this.col.updateOne(
      { _id: new ObjectId(articleId) },
      { $set: { available_for_client: available, updatedAt: new Date() } },
    );
  }

  async setAvailableForAi(versionId: string, available: boolean): Promise<void> {
    if (!ObjectId.isValid(versionId)) throw new NotFoundError('Version', versionId);
    // Root-level article field (not per-version), so no positional operator.
    await this.col.updateOne(
      { 'versions._id': new ObjectId(versionId) },
      { $set: { available_for_ai: available, updatedAt: new Date() } },
    );
  }

  async setArticleProperty(versionId: string, property: ArticleProperty): Promise<void> {
    if (!ObjectId.isValid(versionId)) throw new NotFoundError('Version', versionId);
    // Root-level article field (not per-version), so no positional operator.
    await this.col.updateOne(
      { 'versions._id': new ObjectId(versionId) },
      { $set: { article_property: property, updatedAt: new Date() } },
    );
  }

  /** One-time idempotent backfill: stamps 'paricus' on any legacy doc missing
   *  the ownership field. Safe to run on every boot ($exists:false filter). */
  async backfillArticleProperty(): Promise<number> {
    const result = await this.col.updateMany(
      { article_property: { $exists: false } },
      { $set: { article_property: 'paricus' } },
    );
    return result.modifiedCount;
  }

  // ─── Edit locks ───────────────────────────────────────────────────────────────

  async acquireLock(versionId: string, userId: string, expiresAt: Date): Promise<void> {
    if (!ObjectId.isValid(versionId)) throw new NotFoundError('Version', versionId);
    await this.col.updateOne(
      { 'versions._id': new ObjectId(versionId) },
      { $set: { locked_by_user_id: userId, lock_expires_at: expiresAt, updatedAt: new Date() } },
    );
  }

  async refreshLock(versionId: string, expiresAt: Date): Promise<void> {
    if (!ObjectId.isValid(versionId)) throw new NotFoundError('Version', versionId);
    await this.col.updateOne(
      { 'versions._id': new ObjectId(versionId) },
      { $set: { lock_expires_at: expiresAt, updatedAt: new Date() } },
    );
  }

  async releaseLock(versionId: string): Promise<void> {
    if (!ObjectId.isValid(versionId)) throw new NotFoundError('Version', versionId);
    await this.col.updateOne(
      { 'versions._id': new ObjectId(versionId) },
      { $set: { locked_by_user_id: null, lock_expires_at: null, updatedAt: new Date() } },
    );
  }

  async releaseAllLocks(): Promise<void> {
    await this.col.updateMany(
      { locked_by_user_id: { $ne: null } },
      { $set: { locked_by_user_id: null, lock_expires_at: null, updatedAt: new Date() } },
    );
  }

  async getLockInfo(versionId: string): Promise<ArticleLockInfo | null> {
    if (!ObjectId.isValid(versionId)) return null;
    const article = await this.col.findOne(
      { 'versions._id': new ObjectId(versionId) },
      { projection: { locked_by_user_id: 1, lock_expires_at: 1 } },
    );
    if (!article) return null;
    return {
      locked_by_user_id: article.locked_by_user_id,
      lock_expires_at: article.lock_expires_at,
    };
  }

  // ─── Tags ─────────────────────────────────────────────────────────────────────

  async addTagToVersion(versionId: string, tagId: string): Promise<void> {
    if (!ObjectId.isValid(versionId) || !ObjectId.isValid(tagId)) return;
    const now = new Date();
    await this.col.updateOne(
      { 'versions._id': new ObjectId(versionId) },
      {
        $addToSet: { 'versions.$.tag_ids': new ObjectId(tagId) } as UpdateFilter<KbArticle>['$addToSet'],
        $set: { 'versions.$.updatedAt': now, updatedAt: now },
      },
    );
  }

  async removeTagFromVersion(versionId: string, tagId: string): Promise<void> {
    if (!ObjectId.isValid(versionId) || !ObjectId.isValid(tagId)) return;
    const now = new Date();
    await this.col.updateOne(
      { 'versions._id': new ObjectId(versionId) },
      {
        $pull: { 'versions.$.tag_ids': new ObjectId(tagId) } as UpdateFilter<KbArticle>['$pull'],
        $set: { 'versions.$.updatedAt': now, updatedAt: now },
      },
    );
  }

  // ─── Bulk operations ──────────────────────────────────────────────────────────

  async moveArticlesToTopic(versionIds: string[], topicId: string): Promise<void> {
    const oids = versionIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));
    if (oids.length === 0) return;

    await this.col.updateMany(
      { 'versions._id': { $in: oids } },
      { $set: { topic_id: topicId, updatedAt: new Date() } },
    );
  }

  // ─── Maintenance ──────────────────────────────────────────────────────────────

  async clearExpiredLocks(): Promise<number> {
    const result = await this.col.updateMany(
      { lock_expires_at: { $lt: new Date() } },
      { $set: { locked_by_user_id: null, lock_expires_at: null, updatedAt: new Date() } },
    );
    return result.modifiedCount;
  }

  // ─── External client portal ───────────────────────────────────────────────────

  /** Returns published articles for the given topic IDs.
   *  By default restricts to articles marked `available_for_client: true`.
   *  When `includeUnavailable` is true, returns ALL published articles regardless of that flag
   *  (used by the admin endpoint).
   *  Client/topic resolution is the caller's responsibility (ArticleService). */
  async findPublishedByTopicIds(
    topicIds: string[],
    filters: FilterArticleInput,
    includeUnavailable = false,
  ): Promise<KbArticleVersionView[]> {
    if (topicIds.length === 0) return [];

    const { search } = filters;
    const articleMatch: Record<string, unknown> = { topic_id: { $in: topicIds } };
    if (!includeUnavailable) articleMatch['available_for_client'] = true;

    const matchStages: Record<string, unknown>[] = [
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

    return docs.map((d) => this.aggDocToView(d as Record<string, unknown>));
  }

  /** Returns a single published version for the given topic IDs.
   *  By default restricts to articles marked `available_for_client: true`.
   *  When `includeUnavailable` is true, ignores that flag (admin endpoint).
   *  Client/topic resolution is the caller's responsibility (ArticleService). */
  async findPublishedVersionByTopicIds(
    topicIds: string[],
    versionId: string,
    includeUnavailable = false,
  ): Promise<KbArticleVersionView | null> {
    if (!ObjectId.isValid(versionId)) return null;
    if (topicIds.length === 0) return null;
    const vOid = new ObjectId(versionId);

    const articleFilter: Record<string, unknown> = {
      topic_id: { $in: topicIds },
      'versions._id': vOid,
    };
    if (!includeUnavailable) articleFilter['available_for_client'] = true;

    const article = await this.col.findOne(articleFilter);
    if (!article) return null;

    const version = article.versions.find(
      (v) => v._id.equals(vOid) && v.article_status === 'published',
    );
    if (!version) return null;

    return this.toView(article, version);
  }

  /** Returns every published (article_id, version_id, content) triple for the
   *  maintenance re-chunking job. Optional `topicIds` scopes the result to a
   *  client's topics; omit to walk the entire collection. */
  async findAllPublishedVersionsForChunking(
    topicIds?: string[],
  ): Promise<Array<{ article_id: string; version_id: string; content: string }>> {
    const match: Record<string, unknown> = { 'versions.article_status': 'published' };
    if (topicIds && topicIds.length > 0) {
      match['topic_id'] = { $in: topicIds };
    }

    const docs = await this.col
      .aggregate([
        { $match: match },
        { $unwind: '$versions' },
        { $match: { 'versions.article_status': 'published' } },
        {
          $project: {
            _id: 0,
            article_id: { $toString: '$_id' },
            version_id: { $toString: '$versions._id' },
            content: '$versions.content',
          },
        },
      ])
      .toArray();

    return docs as Array<{ article_id: string; version_id: string; content: string }>;
  }

  // ─── Client copy (dual view) ────────────────────────────────────────────────

  async getClientCopyByArticleId(articleId: string): Promise<KbClientCopyView | null> {
    if (!ObjectId.isValid(articleId)) return null;
    const article = await this.col.findOne({ _id: new ObjectId(articleId) });
    if (!article || !article.client_copy) return null;
    return this.toClientCopyView(article, article.client_copy);
  }

  async getClientCopyByCopyId(copyId: string): Promise<KbClientCopyView | null> {
    if (!ObjectId.isValid(copyId)) return null;
    const article = await this.col.findOne({ 'client_copy._id': new ObjectId(copyId) });
    if (!article || !article.client_copy) return null;
    return this.toClientCopyView(article, article.client_copy);
  }

  async updateClientCopy(
    articleId: string,
    fields: { content?: string; name?: string; synopsis?: string },
    updatedBy: string,
    updatedByName: string | null = null,
  ): Promise<KbClientCopyView | null> {
    if (!ObjectId.isValid(articleId)) return null;
    const now = new Date();
    const set: Record<string, unknown> = {
      'client_copy.updated_by': updatedBy,
      'client_copy.updated_by_name': updatedByName,
      'client_copy.updatedAt': now,
      updatedAt: now,
    };
    if (fields.content !== undefined) {
      set['client_copy.content'] = fields.content;
      set['client_copy.content_text'] = this.htmlToText(fields.content);
    }
    if (fields.name !== undefined) set['client_copy.article_name'] = fields.name;
    if (fields.synopsis !== undefined) set['client_copy.article_synopsis'] = fields.synopsis;

    await this.col.updateOne(
      { _id: new ObjectId(articleId), 'client_copy._id': { $exists: true } },
      { $set: set },
    );
    return this.getClientCopyByArticleId(articleId);
  }

  /** Overwrites the client copy from one of the article's internal versions. */
  async regenerateClientCopyFromVersion(
    articleId: string,
    versionId: string,
    updatedBy: string,
    updatedByName: string | null = null,
  ): Promise<KbClientCopyView | null> {
    if (!ObjectId.isValid(articleId) || !ObjectId.isValid(versionId)) return null;
    const vOid = new ObjectId(versionId);
    const article = await this.col.findOne({ _id: new ObjectId(articleId) });
    if (!article) return null;
    const version = article.versions.find((v) => v._id.equals(vOid));
    if (!version) throw new NotFoundError('Version', versionId);

    const now = new Date();
    const copyId = article.client_copy?._id ?? new ObjectId();
    const newCopy: KbClientCopy = {
      _id: copyId,
      article_name: version.article_name,
      article_synopsis: version.article_synopsis,
      content: version.content,
      content_text: this.htmlToText(version.content),
      content_storage: 'inline',
      updated_by: updatedBy,
      updated_by_name: updatedByName,
      seeded_from_version_id: vOid,
      createdAt: article.client_copy?.createdAt ?? now,
      updatedAt: now,
    };
    await this.col.updateOne(
      { _id: article._id },
      { $set: { client_copy: newCopy, updatedAt: now } },
    );
    return this.toClientCopyView(article, newCopy);
  }

  /** Client-facing list: one client copy per article for the given topics.
   *  Filters to `available_for_client: true` unless `includeUnavailable`. */
  async findClientFacingByTopicIds(
    topicIds: string[],
    includeUnavailable = false,
  ): Promise<KbClientCopyView[]> {
    if (topicIds.length === 0) return [];
    const match: Record<string, unknown> = {
      topic_id: { $in: topicIds },
      'client_copy._id': { $exists: true },
    };
    if (!includeUnavailable) match['available_for_client'] = true;

    const articles = await this.col
      .find(match)
      .sort({ 'client_copy.updatedAt': -1 })
      .toArray();

    return articles
      .filter((a) => a.client_copy)
      .map((a) => this.toClientCopyView(a, a.client_copy!));
  }

  /** Single client copy by its copy id, scoped to the client's topics.
   *  Filters to `available_for_client: true` unless `includeUnavailable`. */
  async findClientFacingByCopyId(
    topicIds: string[],
    copyId: string,
    includeUnavailable = false,
  ): Promise<KbClientCopyView | null> {
    if (!ObjectId.isValid(copyId) || topicIds.length === 0) return null;
    const match: Record<string, unknown> = {
      topic_id: { $in: topicIds },
      'client_copy._id': new ObjectId(copyId),
    };
    if (!includeUnavailable) match['available_for_client'] = true;

    const article = await this.col.findOne(match);
    if (!article || !article.client_copy) return null;
    return this.toClientCopyView(article, article.client_copy);
  }

  /** Resolves client copy views for a set of copy ids (used by client search).
   *  No availability/topic filter — the caller applies those. */
  async findClientCopyViewsByCopyIds(copyIds: string[]): Promise<KbClientCopyView[]> {
    const oids = copyIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));
    if (oids.length === 0) return [];

    const articles = await this.col
      .find({ 'client_copy._id': { $in: oids } })
      .toArray();

    const views: KbClientCopyView[] = [];
    for (const article of articles) {
      if (article.client_copy) views.push(this.toClientCopyView(article, article.client_copy));
    }
    return views;
  }

  /** Every (article_id, client_copy_id, content) triple for re-chunking client
   *  copies. Optional `topicIds` scopes to a client. */
  async findAllClientCopiesForChunking(
    topicIds?: string[],
  ): Promise<Array<{ article_id: string; copy_id: string; content: string }>> {
    const match: Record<string, unknown> = { 'client_copy._id': { $exists: true } };
    if (topicIds && topicIds.length > 0) match['topic_id'] = { $in: topicIds };

    const docs = await this.col
      .aggregate([
        { $match: match },
        {
          $project: {
            _id: 0,
            article_id: { $toString: '$_id' },
            copy_id: { $toString: '$client_copy._id' },
            content: '$client_copy.content',
          },
        },
      ])
      .toArray();

    return docs as Array<{ article_id: string; copy_id: string; content: string }>;
  }
}
