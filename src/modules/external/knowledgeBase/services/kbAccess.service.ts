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
 * On top of the client scope, a folder can be restricted to named staff
 * (`topic_user_access`). A folder is visible only when EVERY restricted folder
 * on its path — itself and its ancestors — lists the user, so restricting a
 * folder hides its subfolders and articles too. Unrestricted folders keep the
 * client-level rule. KB managers bypass both.
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

  /** Topic ids the user may read, or `null` when unrestricted. Deleted
   *  folders are included so their archived articles stay listable. */
  async accessibleTopicIds(userId: string): Promise<string[] | null> {
    const clientIds = await this.accessibleClientIds(userId);
    if (clientIds === null) return null;
    if (clientIds.size === 0) return [];
    const topics = await this.topicRepository.findAllByClientIdsWithDeleted([
      ...clientIds,
    ]);
    const visible = await this.visibleTopicIds(userId, topics);
    return topics.filter((t) => visible.has(t.topic_id)).map((t) => t.topic_id);
  }

  /** Narrows a client's folder list to those the user may see. */
  async filterVisibleTopics(userId: string, topics: KbTopic[]): Promise<KbTopic[]> {
    if (topics.length === 0 || (await this.hasFullAccess(userId))) return topics;
    // Ancestors may sit outside `topics` (e.g. deleted ones), so resolve the
    // path against every folder of the clients involved
    const clientIds = [...new Set(topics.map((t) => t.client_id))];
    const all = await this.topicRepository.findAllByClientIdsWithDeleted(clientIds);
    const visible = await this.visibleTopicIds(userId, all);
    return topics.filter((t) => visible.has(t.topic_id));
  }

  /** Ids among `topics` (a complete per-client set) whose whole path admits the user. */
  private async visibleTopicIds(userId: string, topics: KbTopic[]): Promise<Set<string>> {
    const byId = new Map(topics.map((t) => [t.topic_id, t]));
    const access = await this.topicRepository.findAccessByTopicIds([...byId.keys()]);
    const memo = new Map<string, boolean>();

    const isVisible = (topicId: string, seen: Set<string>): boolean => {
      const cached = memo.get(topicId);
      if (cached !== undefined) return cached;
      const topic = byId.get(topicId);
      // Guard against a corrupt parent cycle
      if (!topic || seen.has(topicId)) return true;
      seen.add(topicId);
      const allowed = access.get(topicId);
      const selfOk = !allowed || allowed.has(userId);
      const result =
        selfOk && (topic.parent_topic_id ? isVisible(topic.parent_topic_id, seen) : true);
      memo.set(topicId, result);
      return result;
    };

    return new Set(topics.filter((t) => isVisible(t.topic_id, new Set())).map((t) => t.topic_id));
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

  /** Resolves the topic (deleted ones too) and asserts access to its owning
   *  client and to every restricted folder on its path. */
  async assertTopicAccess(userId: string, topicId: string): Promise<KbTopic> {
    const topic = await this.topicRepository.findByIdWithDeleted(topicId);
    if (!topic) throw new NotFoundError('Topic', topicId);
    await this.assertClientAccess(userId, topic.client_id);
    const [visible] = await this.filterVisibleTopics(userId, [topic]);
    if (!visible) {
      throw new ActionNotAllowedError('You do not have access to this folder.');
    }
    return topic;
  }
}
