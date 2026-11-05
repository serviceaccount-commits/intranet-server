import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { TYPES } from '../../../../shared/config/containerTypes';
import { AppDataSource } from '../../../../shared/database/data-source';
import { getMongoDb } from '../../../../shared/database/mongo-connection';
import { logger } from '../../../../shared/utils/logger';
import { getArticlesCollection } from '../database/kb-collections';
import { KbTopic } from '../database/kb-domain.types';
import { IClientRepository } from '../interfaces/clients/client.repository.interface';
import { ITopicRepository } from '../interfaces/topics/topic.repository.interface';

/** Root folders named like "IMT - Archived" or "Tempo Archive" are a client's archive. */
const ARCHIVE_FOLDER_NAME = /(^|[\s-])archived?\s*$/i;

/** A client's topics minus its archive folders and everything under them.
 *  Archives are intranet-only: the portal (client and BPO admin views) never
 *  lists them, their articles, or their search hits. */
export function withoutArchiveFolders<T extends Pick<KbTopic, 'topic_id' | 'topic_name' | 'parent_topic_id'>>(
  topics: T[],
): T[] {
  const byId = new Map(topics.map((t) => [t.topic_id, t]));
  const memo = new Map<string, boolean>();
  const inArchive = (t: T, seen: Set<string>): boolean => {
    const cached = memo.get(t.topic_id);
    if (cached !== undefined) return cached;
    if (seen.has(t.topic_id)) return false;
    seen.add(t.topic_id);
    const parent = t.parent_topic_id ? byId.get(t.parent_topic_id) : undefined;
    const result = t.parent_topic_id
      ? parent
        ? inArchive(parent, seen)
        : false
      : ARCHIVE_FOLDER_NAME.test(t.topic_name.trim());
    memo.set(t.topic_id, result);
    return result;
  };
  return topics.filter((t) => !inArchive(t, new Set()));
}

/** Who sees a newly created archive folder. Override with KB_ARCHIVE_FOLDER_EMAILS. */
const DEFAULT_ARCHIVE_EMAILS = ['francisco@paricus.com', 'sara@paricus.com'];

/**
 * Each client keeps archived articles in its own archive folder (one root
 * folder, restricted by default to the people who manage archives). Archiving
 * moves the article there and remembers where it came from
 * (`archived_from_topic_id`); restoring puts it back.
 */
@injectable()
export class KbArchiveFolderService {
  constructor(
    @inject(TYPES.ITopicRepository)
    private topicRepository: ITopicRepository,
    @inject(TYPES.IClientRepository)
    private clientRepository: IClientRepository,
  ) {}

  private get articles() {
    return getArticlesCollection(getMongoDb());
  }

  /** Moves the articles into their client's archive folder, creating it when missing.
   *  Articles already inside an archive folder stay where they are. */
  async moveToArchive(articleIds: string[]): Promise<void> {
    const oids = articleIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
    if (oids.length === 0) return;
    const docs = await this.articles
      .find({ _id: { $in: oids } }, { projection: { topic_id: 1 } })
      .toArray();

    const topicCache = new Map<string, KbTopic[]>();
    const archiveByClient = new Map<string, string>();
    for (const doc of docs) {
      const topic = await this.topicRepository.findByIdWithDeleted(doc.topic_id);
      if (!topic) continue;
      if (!topicCache.has(topic.client_id)) {
        topicCache.set(
          topic.client_id,
          await this.topicRepository.findAllByClientIdsWithDeleted([topic.client_id]),
        );
      }
      const all = topicCache.get(topic.client_id)!;
      if (this.isInsideArchive(topic.topic_id, all)) continue;

      let archiveId = archiveByClient.get(topic.client_id);
      if (!archiveId) {
        archiveId = await this.findOrCreateArchiveFolder(topic.client_id, all);
        archiveByClient.set(topic.client_id, archiveId);
      }
      await this.articles.updateOne(
        { _id: doc._id },
        { $set: { topic_id: archiveId, archived_from_topic_id: doc.topic_id } },
      );
    }
  }

  /** Puts a restored article back in the folder it was archived from. Returns
   *  the folder it ends up in (so deleted ancestors can be brought back). */
  async moveBackFromArchive(articleId: string): Promise<string | null> {
    if (!ObjectId.isValid(articleId)) return null;
    const _id = new ObjectId(articleId);
    const doc = await this.articles.findOne(
      { _id },
      { projection: { topic_id: 1, archived_from_topic_id: 1 } },
    );
    if (!doc) return null;
    const from = doc.archived_from_topic_id;
    if (!from) return doc.topic_id;
    const original = await this.topicRepository.findByIdWithDeleted(from);
    if (!original) {
      // The original folder is gone for good: leave it in the archive folder
      await this.articles.updateOne({ _id }, { $unset: { archived_from_topic_id: '' } });
      return doc.topic_id;
    }
    await this.articles.updateOne(
      { _id },
      { $set: { topic_id: from }, $unset: { archived_from_topic_id: '' } },
    );
    return from;
  }

  private isInsideArchive(topicId: string, all: KbTopic[]): boolean {
    const byId = new Map(all.map((t) => [t.topic_id, t]));
    const seen = new Set<string>();
    let cur = byId.get(topicId);
    while (cur && !seen.has(cur.topic_id)) {
      seen.add(cur.topic_id);
      if (!cur.parent_topic_id) return ARCHIVE_FOLDER_NAME.test(cur.topic_name.trim());
      cur = byId.get(cur.parent_topic_id);
    }
    return false;
  }

  private async findOrCreateArchiveFolder(clientId: string, all: KbTopic[]): Promise<string> {
    const existing = all
      .filter((t) => !t.parent_topic_id && !t.deleted_at && ARCHIVE_FOLDER_NAME.test(t.topic_name.trim()))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const first = existing[0];
    if (first) return first.topic_id;

    const client = await this.clientRepository.findById(clientId);
    const created = await this.topicRepository.create({
      topic_name: `${(client?.client_name ?? 'Client').trim()} - Archived`,
      topic_edit_available: true,
      client_id: clientId,
      parent_topic_id: null,
      user_id: null,
    });
    all.push(created);

    const emails = (process.env['KB_ARCHIVE_FOLDER_EMAILS'] ?? DEFAULT_ARCHIVE_EMAILS.join(','))
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const rows: { user_id: string }[] = emails.length
      ? await AppDataSource.query(
          `SELECT user_id FROM users WHERE lower(work_email) = ANY($1) AND status = 'active'`,
          [emails],
        )
      : [];
    if (rows.length > 0) {
      await this.topicRepository.replaceAccess(created.topic_id, rows.map((r) => r.user_id));
    } else {
      logger.warn(`[kb-archive] archive folder ${created.topic_id} created without an access list`);
    }
    logger.info(`[kb-archive] created archive folder "${created.topic_name}" for client ${clientId}`);
    return created.topic_id;
  }
}
