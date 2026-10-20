import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { ITopicService } from '../interfaces/topics/topic.service.interface';
import { ITopicRepository } from '../interfaces/topics/topic.repository.interface';
import { IArticleRepository } from '../interfaces/articles/article.repository.interface';
import { IClientRepository } from '../interfaces/clients/client.repository.interface';
import { IUserRepository } from '../../../internal/users/interfaces/users/user.repository.interface';
import { KbTopic, KbTopicAccessUser } from '../database/kb-domain.types';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError';
import { ValidationError } from '../../../../shared/errors/ValidationError';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import { CreateTopicInput, CreateTopicSchema } from '../schema/topics/CreateTopicSchema';
import { UpdateTopicInput, UpdateTopicSchema } from '../schema/topics/UpdateTopicSchema';
import {
  CreateManagedTopicInput,
  CreateManagedTopicSchema,
  UpdateManagedTopicInput,
  UpdateManagedTopicSchema,
} from '../schema/manage/ManagedTopicSchemas';
import { KbAccessService } from './kbAccess.service';
import { ArticleChunkingService } from './articleChunking.service';

@injectable()
export class TopicService implements ITopicService {
  constructor(
    @inject(TYPES.ITopicRepository)
    private topicRepository: ITopicRepository,
    @inject(TYPES.IArticleRepository)
    private articleRepository: IArticleRepository,
    @inject(TYPES.IClientRepository)
    private clientRepository: IClientRepository,
    @inject(TYPES.IUserRepository)
    private userRepository: IUserRepository,
    @inject(TYPES.IKbAccessService)
    private kbAccess: KbAccessService,
    @inject(TYPES.IArticleChunkingService)
    private chunkingService: ArticleChunkingService,
  ) {}

  async createTopic(input: CreateTopicInput): Promise<KbTopic> {
    const data = CreateTopicSchema.parse(input);

    if (!data.userId) throw new AuthenticationError('User not authenticated.');

    const user = await this.userRepository.findUserById(data.userId);
    if (!user) throw new NotFoundError('User', data.userId);

    const client = await this.clientRepository.findById(data.clientId);
    if (!client) throw new NotFoundError('Client', data.clientId);

    // When a parent is given, validate that it belongs to the same client so
    // folders never get tangled across tenants.
    if (data.parentTopicId) {
      const parent = await this.topicRepository.findById(data.parentTopicId);
      if (!parent) throw new NotFoundError('Topic', data.parentTopicId);
      if (parent.client_id !== client.client_id) {
        throw new ValidationError(
          'Parent folder belongs to a different client.',
        );
      }
    }

    return this.topicRepository.create({
      topic_name: data.topicName,
      topic_edit_available: true,
      client_id: client.client_id,
      parent_topic_id: data.parentTopicId ?? null,
      user_id: data.userId,
    });
  }

  async updateTopic(input: UpdateTopicInput): Promise<KbTopic> {
    const data = UpdateTopicSchema.parse(input);

    const topic = await this.topicRepository.findById(data.topicId);
    if (!topic) throw new NotFoundError('Topic', data.topicId);

    if (data.topicName !== undefined) {
      topic.topic_name = data.topicName;
    }

    // `parentTopicId` is only checked when the key is present in the payload.
    // Sending `null` explicitly means "promote to root of the client".
    if (Object.prototype.hasOwnProperty.call(data, 'parentTopicId')) {
      const newParentId = data.parentTopicId ?? null;

      if (newParentId === topic.topic_id) {
        throw new ValidationError('A folder cannot be its own parent.');
      }

      if (newParentId !== null) {
        const parent = await this.topicRepository.findById(newParentId);
        if (!parent) throw new NotFoundError('Topic', newParentId);
        if (parent.client_id !== topic.client_id) {
          throw new ValidationError(
            'Parent folder belongs to a different client.',
          );
        }
        // Reject if the candidate parent is one of this topic's descendants:
        // that would create a cycle.
        const descendantIds =
          await this.topicRepository.findAllDescendantIds(topic.topic_id);
        if (descendantIds.includes(newParentId)) {
          throw new ValidationError(
            'Cannot move a folder under one of its own descendants.',
          );
        }
      }

      topic.parent_topic_id = newParentId;
    }

    return this.topicRepository.save(topic);
  }

  // ─── Managed writes (portal write API, X-API-Key INTERNAL_WRITE_API_KEY) ──────

  /**
   * Create a folder/subfolder on behalf of a portal user. The client is
   * resolved from `clientSharedId`; no real intranet user is required.
   */
  async createManagedTopic(
    clientSharedId: string,
    input: CreateManagedTopicInput,
  ): Promise<KbTopic> {
    const data = CreateManagedTopicSchema.parse(input);

    const client = await this.clientRepository.findBySharedId(clientSharedId);
    if (!client) throw new NotFoundError('Client', clientSharedId);

    // When a parent is given, validate that it belongs to the same client so
    // folders never get tangled across tenants.
    if (data.parentTopicId) {
      const parent = await this.topicRepository.findById(data.parentTopicId);
      if (!parent) throw new NotFoundError('Topic', data.parentTopicId);
      if (parent.client_id !== client.client_id) {
        throw new ValidationError(
          'Parent folder belongs to a different client.',
        );
      }
    }

    // Portal users are not intranet users, so there is no owning user_id.
    // The column is nullable; the human author is conveyed via actorName.
    return this.topicRepository.create({
      topic_name: data.topicName,
      topic_edit_available: true,
      client_id: client.client_id,
      parent_topic_id: data.parentTopicId ?? null,
      user_id: null,
    });
  }

  /**
   * Rename and/or move a folder on behalf of a portal user. Verifies the topic
   * belongs to the resolved client, then delegates to the shared rename/move
   * logic (which guards self-parent, cross-tenant moves, and cycles).
   */
  async updateManagedTopic(
    clientSharedId: string,
    topicId: string,
    input: UpdateManagedTopicInput,
  ): Promise<KbTopic> {
    const data = UpdateManagedTopicSchema.parse(input);

    const client = await this.clientRepository.findBySharedId(clientSharedId);
    if (!client) throw new NotFoundError('Client', clientSharedId);

    const topic = await this.topicRepository.findById(topicId);
    if (!topic || topic.client_id !== client.client_id) {
      throw new NotFoundError('Topic', topicId);
    }

    return this.updateTopic({
      topicId,
      ...(data.topicName !== undefined && { topicName: data.topicName }),
      ...(Object.prototype.hasOwnProperty.call(data, 'parentTopicId') && {
        parentTopicId: data.parentTopicId ?? null,
      }),
    });
  }

  /**
   * Delete a folder on behalf of a portal user. Only EMPTY folders are
   * deletable — no subfolders and no articles (any status) — so a portal
   * click can never orphan or drop real client content.
   */
  async deleteManagedTopic(
    clientSharedId: string,
    topicId: string,
  ): Promise<void> {
    const client = await this.clientRepository.findBySharedId(clientSharedId);
    if (!client) throw new NotFoundError('Client', clientSharedId);

    const topic = await this.topicRepository.findById(topicId);
    if (!topic || topic.client_id !== client.client_id) {
      throw new NotFoundError('Topic', topicId);
    }

    const descendantIds = await this.topicRepository.findAllDescendantIds(topicId);
    if (descendantIds.length > 0) {
      throw new BusinessLogicError(
        'The folder has subfolders. Move or delete them first.',
      );
    }

    const articles = await this.articleRepository.findAllLatestByTopicId(topicId);
    if (articles.length > 0) {
      throw new BusinessLogicError(
        'The folder contains articles. Move or delete them first.',
      );
    }

    await this.topicRepository.deleteById(topicId);
  }

  async getTopics(clientId: string, userId: string): Promise<KbTopic[]> {
    await this.kbAccess.assertClientAccess(userId, clientId);
    const topics = await this.topicRepository.findAllByClientId(clientId);
    const visible = await this.kbAccess.filterVisibleTopics(userId, topics);
    // Flag restricted folders so the tree can mark them
    const access = await this.topicRepository.findAccessByTopicIds(
      visible.map((t) => t.topic_id),
    );
    return visible.map((t) => ({ ...t, is_restricted: access.has(t.topic_id) }));
  }

  async getTopicById(topicId: string, userId: string): Promise<KbTopic> {
    const topic = await this.topicRepository.findById(topicId);
    if (!topic) throw new NotFoundError('Topic', topicId);
    await this.kbAccess.assertTopicAccess(userId, topicId);
    return topic;
  }

  // ─── Intranet folder deletion (kb:topic:manage) ───────────────────────────────

  /** The folder, its subfolders and the live (non-archived) articles inside. */
  private async collectFolderContents(topicId: string) {
    const subfolderIds = await this.topicRepository.findAllDescendantIds(topicId);
    const topicIds = [topicId, ...subfolderIds];
    const latest = (
      await Promise.all(topicIds.map((id) => this.articleRepository.findAllLatestByTopicId(id)))
    ).flat();
    const articleIds = [
      ...new Set(latest.filter((a) => a.article_status !== 'archived').map((a) => a.article_id)),
    ];
    return { topicIds, subfolderIds, articleIds };
  }

  async getTopicContents(
    topicId: string,
    userId: string,
  ): Promise<{ subfolders: number; articles: number }> {
    await this.kbAccess.assertTopicAccess(userId, topicId);
    const { subfolderIds, articleIds } = await this.collectFolderContents(topicId);
    return { subfolders: subfolderIds.length, articles: articleIds.length };
  }

  /**
   * Deletes a folder and its subfolders (soft delete) and archives every
   * article inside, so all of it stays recoverable: restoring an archived
   * article brings its folder chain back (see ArticleService.restoreArticles).
   */
  async deleteTopic(
    topicId: string,
    userId: string,
  ): Promise<{ subfolders: number; articles: number }> {
    await this.kbAccess.assertTopicAccess(userId, topicId);
    const { topicIds, subfolderIds, articleIds } = await this.collectFolderContents(topicId);

    if (articleIds.length > 0) {
      await this.articleRepository.archiveArticlesByIds(articleIds);
      for (const articleId of articleIds) {
        await this.chunkingService.clearArticle(articleId);
      }
    }
    await this.topicRepository.softDeleteByIds(topicIds);
    return { subfolders: subfolderIds.length, articles: articleIds.length };
  }

  // ─── Per-folder staff access (kb:topic:manage) ────────────────────────────────

  async getTopicAccess(
    topicId: string,
    userId: string,
  ): Promise<{ restricted: boolean; allowed: KbTopicAccessUser[]; staff: KbTopicAccessUser[] }> {
    const topic = await this.kbAccess.assertTopicAccess(userId, topicId);
    const access = await this.topicRepository.findAccessByTopicIds([topicId]);
    const allowedIds = [...(access.get(topicId) ?? [])];
    const [allowed, staff] = await Promise.all([
      this.topicRepository.findUsersByIds(allowedIds),
      this.topicRepository.findClientStaff(topic.client_id),
    ]);
    return { restricted: allowedIds.length > 0, allowed, staff };
  }

  /** Replaces who may see the folder. An empty list removes the restriction. */
  async setTopicAccess(topicId: string, userIds: string[], userId: string): Promise<void> {
    const topic = await this.kbAccess.assertTopicAccess(userId, topicId);
    const unique = [...new Set(userIds)];

    if (unique.length > 0) {
      const staff = await this.topicRepository.findClientStaff(topic.client_id);
      const staffIds = new Set(staff.map((u) => u.user_id));
      if (unique.some((id) => !staffIds.has(id))) {
        throw new ValidationError(
          'Only staff with access to this client can be given access to its folders.',
        );
      }
      // Restricting a folder you are not on would lock you out of it
      if (!unique.includes(userId) && !(await this.kbAccess.hasFullAccess(userId))) {
        throw new ValidationError('Keep yourself on the list, or you will lose access to this folder.');
      }
    }

    await this.topicRepository.replaceAccess(topicId, unique);
  }
}
