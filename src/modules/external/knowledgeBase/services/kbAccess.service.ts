import { inject, injectable } from 'inversify';

import { TYPES } from '../../../../shared/config/containerTypes';
import { IClientRepository } from '../interfaces/clients/client.repository.interface';
import { ITopicRepository } from '../interfaces/topics/topic.repository.interface';
import { IUserRepository } from '../../../internal/users/interfaces/users/user.repository.interface';
import { ActionNotAllowedError } from '../../../../shared/errors/ActionNotAllowedError';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { KbTopic } from '../database/kb-domain.types';

/**
 * Users holding this permission (KB managers) bypass per-client scoping and
 * see every client's content — mirroring the client management screens they
 * already control. Everyone else is limited to the clients granted to them in
 * the `user_clients` access table (the same source the KB sidebar tree uses).
 */
const KB_PERM_CLIENT_MANAGE = 'kb:client:manage';

/**
 * Per-user read scoping for the internal (staff, JWT) Knowledge Base routes.
 *
 * Historically only the sidebar tree respected `user_clients`; the article
 * list/detail/search endpoints returned every client's content to any
 * authenticated staff user. This service centralizes the checks so ALL read
 * paths enforce the same rule: a user only consumes what they were assigned.
 *
 * The external/portal routes (API-key) are NOT run through this — the portal
 * backend enforces its own per-user kbPrefix scoping and the external service
 * methods already validate article/topic ↔ client consistency.
 */
@injectable()
export class KbAccessService {
  constructor(
    @inject(TYPES.IClientRepository)
    private clientRepository: IClientRepository,
    @inject(TYPES.ITopicRepository)
    private topicRepository: ITopicRepository,
    @inject(TYPES.IUserRepository)
    private userRepository: IUserRepository,
  ) {}

  async hasFullAccess(userId: string): Promise<boolean> {
    const user = await this.userRepository.findUserByIdWithPermissions(userId);
    return (
      user?.role?.permissions?.some(
        (p) => p.permission_id === KB_PERM_CLIENT_MANAGE,
      ) ?? false
    );
  }

  /** Client ids the user may read, or `null` when unrestricted (KB manager). */
  async accessibleClientIds(userId: string): Promise<Set<string> | null> {
    if (await this.hasFullAccess(userId)) return null;
    const clients = await this.clientRepository.findAllWithUserId(userId);
    return new Set(clients.map((c) => c.client_id));
  }

  /** Topic ids the user may read, or `null` when unrestricted. */
  async accessibleTopicIds(userId: string): Promise<string[] | null> {
    const clientIds = await this.accessibleClientIds(userId);
    if (clientIds === null) return null;
    if (clientIds.size === 0) return [];
    const topics = await this.topicRepository.findAllByClientIds([
      ...clientIds,
    ]);
    return topics.map((t) => t.topic_id);
  }

  async assertClientAccess(userId: string, clientId: string): Promise<void> {
    const clientIds = await this.accessibleClientIds(userId);
    if (clientIds === null) return;
    if (!clientIds.has(clientId)) {
      throw new ActionNotAllowedError(
        'You do not have access to this client’s knowledge base.',
      );
    }
  }

  /** Resolves the topic and asserts access to its owning client. */
  async assertTopicAccess(userId: string, topicId: string): Promise<KbTopic> {
    const topic = await this.topicRepository.findById(topicId);
    if (!topic) throw new NotFoundError('Topic', topicId);
    await this.assertClientAccess(userId, topic.client_id);
    return topic;
  }
}
