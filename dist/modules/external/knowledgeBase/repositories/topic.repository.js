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
let TopicRepository = class TopicRepository {
    get repo() {
        return data_source_1.AppDataSource.manager.getRepository(Topic_entity_1.Topic);
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
    async findByName(name) {
        return this.repo.findOne({ where: { topic_name: name } });
    }
    async save(topic) {
        return this.repo.save(topic);
    }
    /** Returns every topic_id under the given root (root NOT included), walking
     *  the parent_topic_id self-reference recursively. Used to validate cycles
     *  and to power "include subfolders" reads. */
    async findAllDescendantIds(rootTopicId) {
        const rows = await this.repo.query(`WITH RECURSIVE descendants AS (
         SELECT topic_id FROM topics WHERE parent_topic_id = $1
         UNION ALL
         SELECT t.topic_id FROM topics t
         INNER JOIN descendants d ON t.parent_topic_id = d.topic_id
       )
       SELECT topic_id FROM descendants`, [rootTopicId]);
        return rows.map((r) => r.topic_id);
    }
};
exports.TopicRepository = TopicRepository;
exports.TopicRepository = TopicRepository = __decorate([
    (0, inversify_1.injectable)()
], TopicRepository);
//# sourceMappingURL=topic.repository.js.map