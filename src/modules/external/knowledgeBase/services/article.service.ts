import { inject, injectable } from 'inversify';
import * as cheerio from 'cheerio';

import { TYPES } from '../../../../shared/config/containerTypes';
import { IUserRepository } from '../../../internal/users/interfaces/users/user.repository.interface';
import { IArticleRepository } from '../interfaces/articles/article.repository.interface';
import { ITopicRepository } from '../interfaces/topics/topic.repository.interface';
import { IClientRepository } from '../interfaces/clients/client.repository.interface';
import { ITagRepository } from '../interfaces/tags/tag.repository.interface';
import {
  IArticleService,
  ExternalClientArticle,
  ExternalClientArticleDetail,
} from '../interfaces/articles/article.service.interface';
import {
  KbArticleVersionView,
  PaginatedArticlesResult,
  ArticleLockInfo,
  KbTag,
} from '../database/kb-domain.types';
import { ValidationError } from '../../../../shared/errors/ValidationError';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import { FilterArticleInput } from '../schema/articles/FilterArticleSchema';
import { MoveArticleInput, MoveArticleSchema } from '../schema/clients/MoveArticleSchema';
import { CreateVersionInput, CreateVersionSchema } from '../schema/articles/CreateVersionSchema';
import { generateArticleSynopsis } from '../../../../shared/utils/ai.service';
import { ARTICLE_LOCK_DURATION_MS } from '../kb.constants';
import { ArticleChunkingService } from './articleChunking.service';

const KB_PERM_VIEW_METADATA = 'kb:article:view:metadata';

@injectable()
export class ArticleService implements IArticleService {
  constructor(
    @inject(TYPES.IArticleRepository)
    private articleRepository: IArticleRepository,
    @inject(TYPES.ITopicRepository)
    private topicRepository: ITopicRepository,
    @inject(TYPES.IClientRepository)
    private clientRepository: IClientRepository,
    @inject(TYPES.IUserRepository)
    private userRepository: IUserRepository,
    @inject(TYPES.ITagRepository)
    private tagRepository: ITagRepository,
    @inject(TYPES.IArticleChunkingService)
    private chunkingService: ArticleChunkingService,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async getCanSeeDraft(userId: string): Promise<boolean> {
    const user = await this.userRepository.findUserByIdWithPermissions(userId);
    return (
      user?.role.permissions.findIndex(
        (p) => p.permission_id === KB_PERM_VIEW_METADATA,
      ) !== -1
    );
  }

  // ─── Create ───────────────────────────────────────────────────────────────────

  async createArticle(
    articleName: string,
    content: string,
    topicId: string,
    userId: string,
  ): Promise<KbArticleVersionView> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) throw new NotFoundError('User', userId);

    const topic = await this.topicRepository.findById(topicId);
    if (!topic) throw new NotFoundError('Topic', topicId);

    const updatedByName = `${user.first_name} ${user.last_name}`;
    const created = await this.articleRepository.createArticle(topicId, userId, articleName, content, updatedByName);
    if (content && content.trim()) {
      await this.chunkingService.processVersionSafe(created.article_id, created.article_version_id, content);
    }
    return created;
  }

  async createVersion(
    input: CreateVersionInput,
    userId: string,
  ): Promise<KbArticleVersionView> {
    const data = CreateVersionSchema.parse(input);

    const user = await this.userRepository.findUserById(userId);
    if (!user) throw new NotFoundError('User', userId);

    const existing = await this.articleRepository.findByVersionId(data.versionId);
    if (!existing) throw new NotFoundError('Version', data.versionId);

    const newVersion = await this.articleRepository.addVersion(data.versionId, {
      useVersionAsTemplate: data.useVersionAsTemplate,
      userId,
      updatedByName: `${user.first_name} ${user.last_name}`,
    });
    if (data.useVersionAsTemplate && newVersion.content && newVersion.content.trim()) {
      await this.chunkingService.processVersionSafe(newVersion.article_id, newVersion.article_version_id, newVersion.content);
    }
    return newVersion;
  }

  // ─── Content updates ──────────────────────────────────────────────────────────

  async updateArticleContent(
    versionId: string,
    content: string,
    userId: string,
  ): Promise<void> {
    const [existing, user] = await Promise.all([
      this.articleRepository.findByVersionId(versionId),
      this.userRepository.findUserById(userId),
    ]);
    if (!existing) throw new NotFoundError('Article', versionId);

    const updatedByName = user ? `${user.first_name} ${user.last_name}` : null;
    await this.articleRepository.updateVersionContent(versionId, content, userId, updatedByName);
    await this.chunkingService.processVersionSafe(existing.article_id, versionId, content);
  }

  async updateArticleName(versionId: string, articleName: string): Promise<void> {
    if (articleName.length < 2) {
      throw new ValidationError('Article name must be at least 2 characters.');
    }
    const existing = await this.articleRepository.findByVersionId(versionId);
    if (!existing) throw new NotFoundError('Article', versionId);

    await this.articleRepository.updateVersionName(versionId, articleName);
  }

  async updateArticleSynopsis(versionId: string, synopsis: string): Promise<void> {
    if (synopsis.length < 2) {
      throw new ValidationError('Synopsis must be at least 2 characters.');
    }
    const existing = await this.articleRepository.findByVersionId(versionId);
    if (!existing) throw new NotFoundError('Article', versionId);

    await this.articleRepository.updateVersionSynopsis(versionId, synopsis);
  }

  async generateAISynopsis(versionId: string): Promise<string> {
    const article = await this.articleRepository.findByVersionId(versionId);
    if (!article) throw new NotFoundError('Article Version', versionId);

    const $ = cheerio.load(article.content);
    $('br').replaceWith(' ');
    $('p, li, h1, h2, h3, div, th, td, blockquote').after('\n\n');
    const plainText = $('body').text().trim();

    const synopsis = await generateArticleSynopsis(plainText);
    await this.articleRepository.updateVersionSynopsis(versionId, synopsis);

    return synopsis;
  }

  // ─── Edit lock ────────────────────────────────────────────────────────────────

  async startArticleEdit(userId: string, versionId: string): Promise<void> {
    const lockInfo = await this.articleRepository.getLockInfo(versionId);
    if (!lockInfo) throw new NotFoundError('Article', versionId);

    const now = new Date();
    if (lockInfo.locked_by_user_id && lockInfo.lock_expires_at && lockInfo.lock_expires_at > now) {
      throw new BusinessLogicError('Article is currently being edited by another user.');
    }

    const expiresAt = new Date(now.getTime() + ARTICLE_LOCK_DURATION_MS);
    await this.articleRepository.acquireLock(versionId, userId, expiresAt);
  }

  async refreshEditLock(userId: string, versionId: string): Promise<void> {
    const lockInfo = await this.articleRepository.getLockInfo(versionId);
    if (!lockInfo) throw new NotFoundError('Article', versionId);

    if (lockInfo.locked_by_user_id && lockInfo.locked_by_user_id !== userId) {
      throw new BusinessLogicError('You do not own this lock.');
    }

    const expiresAt = new Date(Date.now() + ARTICLE_LOCK_DURATION_MS);
    await this.articleRepository.refreshLock(versionId, expiresAt);
  }

  async closeArticleEdit(userId: string, versionId: string): Promise<void> {
    const lockInfo = await this.articleRepository.getLockInfo(versionId);
    if (!lockInfo) throw new NotFoundError('Article', versionId);

    if (lockInfo.locked_by_user_id && lockInfo.locked_by_user_id !== userId) {
      throw new BusinessLogicError('You do not own this lock.');
    }

    await this.articleRepository.releaseLock(versionId);
  }

  async releaseAllArticleLocks(): Promise<void> {
    await this.articleRepository.releaseAllLocks();
  }

  async getArticleLockInfo(versionId: string): Promise<ArticleLockInfo> {
    const lockInfo = await this.articleRepository.getLockInfo(versionId);
    if (!lockInfo) throw new NotFoundError('Article', versionId);
    return lockInfo;
  }

  // ─── Tags ─────────────────────────────────────────────────────────────────────

  async addTagToArticle(versionId: string, tagName: string): Promise<KbTag> {
    const existing = await this.articleRepository.findByVersionId(versionId);
    if (!existing) throw new NotFoundError('Article', versionId);

    let tag = await this.tagRepository.findByName(tagName);
    if (!tag) {
      tag = await this.tagRepository.create({ tag_name: tagName });
    }

    await this.articleRepository.addTagToVersion(versionId, tag._id.toString());
    return tag;
  }

  async removeTagFromArticle(versionId: string, tagId: string): Promise<void> {
    const existing = await this.articleRepository.findByVersionId(versionId);
    if (!existing) throw new NotFoundError('Article', versionId);

    await this.articleRepository.removeTagFromVersion(versionId, tagId);
  }

  // ─── Queries ──────────────────────────────────────────────────────────────────

  async getArticles(topicId: string): Promise<KbArticleVersionView[]> {
    return this.articleRepository.findAllLatestByTopicId(topicId);
  }

  async findLatestArticlesByUserId(userId: string): Promise<KbArticleVersionView[]> {
    const clients = await this.clientRepository.findAllWithUserId(userId);
    if (clients.length === 0) return [];

    const clientIds = clients.map((c) => c.client_id);
    const topics = await this.topicRepository.findAllByClientIds(clientIds);
    if (topics.length === 0) return [];

    const topicIds = topics.map((t) => t.topic_id);
    return this.articleRepository.findRecentByTopicIds(topicIds, 10);
  }

  async findArticles(
    filters: FilterArticleInput,
    userId: string,
  ): Promise<PaginatedArticlesResult> {
    const canSeeDraft = await this.getCanSeeDraft(userId);
    return this.articleRepository.findAndCount(filters, canSeeDraft);
  }

  async findArticlesByClientId(
    clientId: string,
    filters: FilterArticleInput,
    userId: string,
  ): Promise<PaginatedArticlesResult> {
    const canSeeDraft = await this.getCanSeeDraft(userId);

    const topics = await this.topicRepository.findAllByClientId(clientId);
    if (topics.length === 0) return { articles: [], total: 0 };

    const topicIds = topics.map((t) => t.topic_id);
    return this.articleRepository.findAndCountByTopicIds(topicIds, filters, canSeeDraft);
  }

  async findArticlesByTopicId(
    topicId: string,
    filters: FilterArticleInput,
    userId: string,
  ): Promise<PaginatedArticlesResult> {
    const canSeeDraft = await this.getCanSeeDraft(userId);
    return this.articleRepository.findAndCountByTopicId(topicId, filters, canSeeDraft);
  }

  async getArticleById(versionId: string): Promise<KbArticleVersionView> {
    const article = await this.articleRepository.findByVersionId(versionId);
    if (!article) throw new NotFoundError('Article', versionId);
    return article;
  }

  async getArticleWithDetails(versionId: string): Promise<{
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
  }> {
    const view = await this.articleRepository.findByVersionId(versionId);
    if (!view) throw new NotFoundError('Article', versionId);

    const [tags, topic, creator, updater, publisher] = await Promise.all([
      this.tagRepository.findByIds(view.tag_ids),
      this.topicRepository.findById(view.topic_id),
      view.created_by ? this.userRepository.findUserById(view.created_by) : null,
      view.updated_by ? this.userRepository.findUserById(view.updated_by) : null,
      view.published_by ? this.userRepository.findUserById(view.published_by) : null,
    ]);

    return {
      article: {
        article_version_id: view.article_version_id,
        article_name: view.article_name,
        article_synopsis: view.article_synopsis,
        article_status: view.article_status,
        version: view.version,
        locked_by_user_id: view.locked_by_user_id,
        lock_expires_at: view.lock_expires_at,
        createdAt: view.createdAt,
        updatedAt: view.updatedAt,
        published_at: view.published_at,
        tags: tags.map((t) => ({ tag_id: t._id.toString(), tag_name: t.tag_name })),
        user: creator ? { first_name: creator.first_name, last_name: creator.last_name } : null,
        user_update: updater ? { first_name: updater.first_name, last_name: updater.last_name } : null,
        user_publish: publisher ? { first_name: publisher.first_name, last_name: publisher.last_name } : null,
        article: {
          article_id: view.article_id,
          topic: topic
            ? { topic_id: topic.topic_id, topic_name: topic.topic_name, client_id: topic.client_id }
            : { topic_id: view.topic_id, topic_name: '', client_id: '' },
          user_id: view.user_id,
        },
      },
      available_for_client: view.available_for_client,
    };
  }

  async getArticleDocumentById(versionId: string): Promise<string> {
    const article = await this.articleRepository.findByVersionId(versionId);
    if (!article) throw new NotFoundError('Article', versionId);
    return article.content;
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  async moveArticleToTopic(input: MoveArticleInput, _userId: string): Promise<void> {
    const data = MoveArticleSchema.parse(input);

    const topic = await this.topicRepository.findById(data.topicId);
    if (!topic) throw new NotFoundError('Topic', data.topicId);

    await this.articleRepository.moveArticlesToTopic(data.articleIds, data.topicId);
  }

  async getArticleVersionsByArticleVersionId(
    versionId: string,
  ): Promise<KbArticleVersionView[]> {
    const versions = await this.articleRepository.findVersionsByVersionId(versionId);
    if (versions.length === 0) throw new BusinessLogicError('No versions found.');
    return versions;
  }

  async publishVersion(versionId: string): Promise<KbArticleVersionView> {
    const article = await this.articleRepository.findByVersionId(versionId);
    if (!article) throw new NotFoundError('Article version', versionId);

    if (article.article_status !== 'draft' && article.article_status !== 'unpublished') {
      throw new BusinessLogicError(
        'Article must be in draft or unpublished status to publish.',
      );
    }

    await this.articleRepository.updateVersionStatus(versionId, 'published');

    const updated = await this.articleRepository.findByVersionId(versionId);
    if (!updated) throw new NotFoundError('Article version', versionId);
    return updated;
  }

  async unpublishVersion(versionId: string): Promise<KbArticleVersionView> {
    const article = await this.articleRepository.findByVersionId(versionId);
    if (!article) throw new NotFoundError('Article version', versionId);

    if (article.article_status !== 'published') {
      throw new BusinessLogicError('Article is not in published status.');
    }

    await this.articleRepository.updateVersionStatus(versionId, 'unpublished');

    const updated = await this.articleRepository.findByVersionId(versionId);
    if (!updated) throw new NotFoundError('Article version', versionId);
    return updated;
  }

  async publishVersions(versionIds: string[]): Promise<void> {
    const versions = await this.articleRepository.findByVersionIds(versionIds);
    if (versions.length === 0) throw new BusinessLogicError('No versions found.');

    for (const v of versions) {
      if (v.article_status !== 'unpublished') {
        throw new BusinessLogicError(`Version ${v.article_version_id} is not in unpublished status.`);
      }
    }

    await this.articleRepository.updateVersionsStatus(versionIds, 'published');
  }

  async unpublishVersions(versionIds: string[]): Promise<void> {
    const versions = await this.articleRepository.findByVersionIds(versionIds);
    if (versions.length === 0) throw new BusinessLogicError('No versions found.');

    for (const v of versions) {
      if (v.article_status !== 'published') {
        throw new BusinessLogicError(`Version ${v.article_version_id} is not in published status.`);
      }
    }

    await this.articleRepository.updateVersionsStatus(versionIds, 'unpublished');
  }

  // ─── External client portal ───────────────────────────────────────────────────

  /** Resolves clientSharedId → client → topics, then delegates to the repo. */
  private async resolveTopicIdsForSharedClient(clientSharedId: string): Promise<string[]> {
    const client = await this.clientRepository.findBySharedId(clientSharedId);
    if (!client) return [];

    const topics = await this.topicRepository.findAllByClientId(client.client_id);
    return topics.map((t) => t.topic_id);
  }

  async findSharedArticlesByClientSharedId(
    filters: FilterArticleInput,
    clientSharedId: string,
  ): Promise<ExternalClientArticle[]> {
    const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
    if (topicIds.length === 0) return [];

    const views = await this.articleRepository.findPublishedByTopicIds(topicIds, filters);

    return views.map((v) => ({
      article_id: v.article_version_id,
      article_name: v.article_name,
      article_synopsis: v.article_synopsis,
      updated_at: v.updatedAt,
    }));
  }

  async getArticleByExternalClientAndArticleId(
    clientSharedId: string,
    versionId: string,
  ): Promise<ExternalClientArticleDetail> {
    const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
    if (topicIds.length === 0) throw new NotFoundError('Client', clientSharedId);

    const view = await this.articleRepository.findPublishedVersionByTopicIds(topicIds, versionId);
    if (!view) throw new NotFoundError('Article', versionId);

    return {
      article: {
        article_id: view.article_version_id,
        article_name: view.article_name,
        article_synopsis: view.article_synopsis,
        updated_at: view.updatedAt,
      },
      content: view.content,
    };
  }
}
