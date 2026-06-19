import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { ITopicService } from '../interfaces/topics/topic.service.interface';
import { ITopicRepository } from '../interfaces/topics/topic.repository.interface';
import { IClientRepository } from '../interfaces/clients/client.repository.interface';
import { IUserRepository } from '../../../internal/users/interfaces/users/user.repository.interface';
import { KbTopic } from '../database/kb-domain.types';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError';
import { ValidationError } from '../../../../shared/errors/ValidationError';
import { CreateTopicInput, CreateTopicSchema } from '../schema/topics/CreateTopicSchema';
import { UpdateTopicInput, UpdateTopicSchema } from '../schema/topics/UpdateTopicSchema';
import {
  CreateManagedTopicInput,
  CreateManagedTopicSchema,
  UpdateManagedTopicInput,
  UpdateManagedTopicSchema,
} from '../schema/manage/ManagedTopicSchemas';

@injectable()
export class TopicService implements ITopicService {
  constructor(
    @inject(TYPES.ITopicRepository)
    private topicRepository: ITopicRepository,
    @inject(TYPES.IClientRepository)
    private clientRepository: IClientRepository,
    @inject(TYPES.IUserRepository)
    private userRepository: IUserRepository,
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

  /** Actor recorded on portal-originated folder writes. Not a real intranet
   *  user — valid UUID shape so Postgres user joins don't error. Mirrors
   *  ArticleService.PORTAL_ACTOR_ID. */
  private static readonly PORTAL_ACTOR_ID =
    '00000000-0000-4000-8000-000000000001';

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

    return this.topicRepository.create({
      topic_name: data.topicName,
      topic_edit_available: true,
      client_id: client.client_id,
      parent_topic_id: data.parentTopicId ?? null,
      user_id: TopicService.PORTAL_ACTOR_ID,
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

  async getTopics(clientId: string): Promise<KbTopic[]> {
    return this.topicRepository.findAllByClientId(clientId);
  }

  async getTopicById(topicId: string): Promise<KbTopic> {
    const topic = await this.topicRepository.findById(topicId);
    if (!topic) throw new NotFoundError('Topic', topicId);
    return topic;
  }
}
