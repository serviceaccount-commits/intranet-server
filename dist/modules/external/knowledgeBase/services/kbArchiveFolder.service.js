"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KbArchiveFolderService = void 0;
exports.withoutArchiveFolders = withoutArchiveFolders;
const inversify_1 = require("inversify");
const mongodb_1 = require("mongodb");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const data_source_1 = require("../../../../shared/database/data-source");
const mongo_connection_1 = require("../../../../shared/database/mongo-connection");
const logger_1 = require("../../../../shared/utils/logger");
const kb_collections_1 = require("../database/kb-collections");
/** Root folders named like "IMT - Archived" or "Tempo Archive" are a client's archive. */
const ARCHIVE_FOLDER_NAME = /(^|[\s-])archived?\s*$/i;
/** A client's topics minus its archive folders and everything under them.
 *  Archives are intranet-only: the portal (client and BPO admin views) never
 *  lists them, their articles, or their search hits. */
function withoutArchiveFolders(topics) {
    const byId = new Map(topics.map((t) => [t.topic_id, t]));
    const memo = new Map();
    const inArchive = (t, seen) => {
        const cached = memo.get(t.topic_id);
        if (cached !== undefined)
            return cached;
        if (seen.has(t.topic_id))
            return false;
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
let KbArchiveFolderService = class KbArchiveFolderService {
    topicRepository;
    clientRepository;
    constructor(topicRepository, clientRepository) {
        this.topicRepository = topicRepository;
        this.clientRepository = clientRepository;
    }
    get articles() {
        return (0, kb_collections_1.getArticlesCollection)((0, mongo_connection_1.getMongoDb)());
    }
    /** Moves the articles into their client's archive folder, creating it when missing.
     *  Articles already inside an archive folder stay where they are. */
    async moveToArchive(articleIds) {
        const oids = articleIds.filter((id) => mongodb_1.ObjectId.isValid(id)).map((id) => new mongodb_1.ObjectId(id));
        if (oids.length === 0)
            return;
        const docs = await this.articles
            .find({ _id: { $in: oids } }, { projection: { topic_id: 1 } })
            .toArray();
        const topicCache = new Map();
        const archiveByClient = new Map();
        for (const doc of docs) {
            const topic = await this.topicRepository.findByIdWithDeleted(doc.topic_id);
            if (!topic)
                continue;
            if (!topicCache.has(topic.client_id)) {
                topicCache.set(topic.client_id, await this.topicRepository.findAllByClientIdsWithDeleted([topic.client_id]));
            }
            const all = topicCache.get(topic.client_id);
            if (this.isInsideArchive(topic.topic_id, all))
                continue;
            let archiveId = archiveByClient.get(topic.client_id);
            if (!archiveId) {
                archiveId = await this.findOrCreateArchiveFolder(topic.client_id, all);
                archiveByClient.set(topic.client_id, archiveId);
            }
            await this.articles.updateOne({ _id: doc._id }, { $set: { topic_id: archiveId, archived_from_topic_id: doc.topic_id } });
        }
    }
    /** Puts a restored article back in the folder it was archived from. Returns
     *  the folder it ends up in (so deleted ancestors can be brought back). */
    async moveBackFromArchive(articleId) {
        if (!mongodb_1.ObjectId.isValid(articleId))
            return null;
        const _id = new mongodb_1.ObjectId(articleId);
        const doc = await this.articles.findOne({ _id }, { projection: { topic_id: 1, archived_from_topic_id: 1 } });
        if (!doc)
            return null;
        const from = doc.archived_from_topic_id;
        if (!from)
            return doc.topic_id;
        const original = await this.topicRepository.findByIdWithDeleted(from);
        if (!original) {
            // The original folder is gone for good: leave it in the archive folder
            await this.articles.updateOne({ _id }, { $unset: { archived_from_topic_id: '' } });
            return doc.topic_id;
        }
        await this.articles.updateOne({ _id }, { $set: { topic_id: from }, $unset: { archived_from_topic_id: '' } });
        return from;
    }
    isInsideArchive(topicId, all) {
        const byId = new Map(all.map((t) => [t.topic_id, t]));
        const seen = new Set();
        let cur = byId.get(topicId);
        while (cur && !seen.has(cur.topic_id)) {
            seen.add(cur.topic_id);
            if (!cur.parent_topic_id)
                return ARCHIVE_FOLDER_NAME.test(cur.topic_name.trim());
            cur = byId.get(cur.parent_topic_id);
        }
        return false;
    }
    async findOrCreateArchiveFolder(clientId, all) {
        const existing = all
            .filter((t) => !t.parent_topic_id && !t.deleted_at && ARCHIVE_FOLDER_NAME.test(t.topic_name.trim()))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const first = existing[0];
        if (first)
            return first.topic_id;
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
        const rows = emails.length
            ? await data_source_1.AppDataSource.query(`SELECT user_id FROM users WHERE lower(work_email) = ANY($1) AND status = 'active'`, [emails])
            : [];
        if (rows.length > 0) {
            await this.topicRepository.replaceAccess(created.topic_id, rows.map((r) => r.user_id));
        }
        else {
            logger_1.logger.warn(`[kb-archive] archive folder ${created.topic_id} created without an access list`);
        }
        logger_1.logger.info(`[kb-archive] created archive folder "${created.topic_name}" for client ${clientId}`);
        return created.topic_id;
    }
};
exports.KbArchiveFolderService = KbArchiveFolderService;
exports.KbArchiveFolderService = KbArchiveFolderService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ITopicRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IClientRepository)),
    __metadata("design:paramtypes", [Object, Object])
], KbArchiveFolderService);
//# sourceMappingURL=kbArchiveFolder.service.js.map