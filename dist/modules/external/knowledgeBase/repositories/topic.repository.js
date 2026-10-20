"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicRepository = void 0;
const inversify_1 = require("inversify");
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../../../shared/database/data-source");
const Topic_entity_1 = require("../entities/Topic.entity");
const TopicUserAccess_entity_1 = require("../entities/TopicUserAccess.entity");
let TopicRepository = class TopicRepository {
    get repo() {
        return data_source_1.AppDataSource.manager.getRepository(Topic_entity_1.Topic);
    }
    get accessRepo() {
        return data_source_1.AppDataSource.manager.getRepository(TopicUserAccess_entity_1.TopicUserAccess);
    }
    async create(data) {
        const topic = this.repo.create(data);
        return this.repo.save(topic);
    }
    async findAll() {
        return this.repo.find({ order: { topic_name: 'ASC' } });
    }
    async findAllByClientId(clientId) {
        return this.repo.find({
            where: { client_id: clientId },
            order: { topic_name: 'ASC' },
        });
    }
    async findAllByClientIds(clientIds) {
        if (clientIds.length === 0)
            return [];
        return this.repo.find({ where: { client_id: (0, typeorm_1.In)(clientIds) } });
    }
    async findById(id) {
        return this.repo.findOne({ where: { topic_id: id } });
    }
    async findByIdWithDeleted(id) {
        return this.repo.findOne({ where: { topic_id: id }, withDeleted: true });
    }
    async findAllByClientIdsWithDeleted(clientIds) {
        if (clientIds.length === 0)
            return [];
        return this.repo.find({
            where: { client_id: (0, typeorm_1.In)(clientIds) },
            withDeleted: true,
        });
    }
    async softDeleteByIds(ids) {
        if (ids.length === 0)
            return;
        await this.repo.softDelete({ topic_id: (0, typeorm_1.In)(ids) });
    }
    async restoreByIds(ids) {
        if (ids.length === 0)
            return;
        await this.repo.restore({ topic_id: (0, typeorm_1.In)(ids) });
    }
    async findByName(name) {
        return this.repo.findOne({ where: { topic_name: name } });
    }
    async save(topic) {
        return this.repo.save(topic);
    }
    async deleteById(id) {
        await this.repo.delete({ topic_id: id });
    }
    /** Returns every topic_id under the given root (root NOT included), walking
     *  the parent_topic_id self-reference recursively. Used to validate cycles
     *  and to power "include subfolders" reads. */
    async findAllDescendantIds(rootTopicId) {
        const rows = await this.repo.query(`WITH RECURSIVE descendants AS (
         SELECT topic_id FROM topics
         WHERE parent_topic_id = $1 AND deleted_at IS NULL
         UNION ALL
         SELECT t.topic_id FROM topics t
         INNER JOIN descendants d ON t.parent_topic_id = d.topic_id
         WHERE t.deleted_at IS NULL
       )
       SELECT topic_id FROM descendants`, [rootTopicId]);
        return rows.map((r) => r.topic_id);
    }
    // ─── Per-folder staff access ──────────────────────────────────────────────────
    /** topic_id → user_ids allowed, for every restricted topic among `topicIds`.
     *  Topics missing from the map are unrestricted. */
    async findAccessByTopicIds(topicIds) {
        const map = new Map();
        if (topicIds.length === 0)
            return map;
        const rows = await this.accessRepo.find({ where: { topic_id: (0, typeorm_1.In)(topicIds) } });
        for (const row of rows) {
            if (!map.has(row.topic_id))
                map.set(row.topic_id, new Set());
            map.get(row.topic_id).add(row.user_id);
        }
        return map;
    }
    /** Replaces the folder's allow-list; an empty list lifts the restriction. */
    async replaceAccess(topicId, userIds) {
        await data_source_1.AppDataSource.manager.transaction(async (manager) => {
            await manager.delete(TopicUserAccess_entity_1.TopicUserAccess, { topic_id: topicId });
            if (userIds.length > 0) {
                await manager.insert(TopicUserAccess_entity_1.TopicUserAccess, userIds.map((user_id) => ({ topic_id: topicId, user_id })));
            }
        });
    }
    /** Active staff with access to the client (user_clients), A→Z. */
    async findClientStaff(clientId) {
        return this.repo.query(`SELECT u.user_id, u.first_name, u.last_name, u.work_email
         FROM user_clients uc
         INNER JOIN users u ON u.user_id = uc.user_id
        WHERE uc.client_id = $1 AND u.status = 'active'
        ORDER BY u.first_name, u.last_name`, [clientId]);
    }
    async findUsersByIds(userIds) {
        if (userIds.length === 0)
            return [];
        return this.repo.query(`SELECT user_id, first_name, last_name, work_email
         FROM users WHERE user_id = ANY($1::uuid[])
        ORDER BY first_name, last_name`, [userIds]);
    }
};
exports.TopicRepository = TopicRepository;
exports.TopicRepository = TopicRepository = __decorate([
    (0, inversify_1.injectable)()
], TopicRepository);
//# sourceMappingURL=topic.repository.js.map