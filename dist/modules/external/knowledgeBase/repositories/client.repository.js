"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRepository = void 0;
const inversify_1 = require("inversify");
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../../../shared/database/data-source");
const Client_entity_1 = require("../entities/Client.entity");
let ClientRepository = class ClientRepository {
    get repo() {
        return data_source_1.AppDataSource.manager.getRepository(Client_entity_1.Client);
    }
    async create(data) {
        const client = this.repo.create(data);
        return this.repo.save(client);
    }
    async findAll() {
        return this.repo.find({ order: { client_name: 'ASC' } });
    }
    async findAllWithUserId(userId) {
        return data_source_1.AppDataSource.manager
            .createQueryBuilder(Client_entity_1.Client, 'client')
            .innerJoin('client.users', 'user', 'user.user_id = :userId', { userId })
            .orderBy('client.client_name', 'ASC')
            .getMany();
    }
    async findAllByRegionOrdered(region) {
        return this.repo.find({
            where: { region },
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id) {
        return this.repo.findOne({ where: { client_id: id } });
    }
    async findByIds(ids) {
        if (ids.length === 0)
            return [];
        const { In } = await import('typeorm');
        return this.repo.find({ where: { client_id: In(ids) } });
    }
    async findBySharedId(sharedId) {
        return this.repo.findOne({ where: { client_shared_id: sharedId } });
    }
    async findIMClient() {
        return this.repo.findOne({ where: { is_im: true } });
    }
    async findFLXClient() {
        return this.repo.findOne({ where: { is_flx: true } });
    }
    async findByName(name) {
        return this.repo.findOne({ where: { client_name: name } });
    }
    async save(client) {
        return this.repo.save(client);
    }
    async findAndCountAllFiltered(input) {
        const { search, entity, page, limit } = input;
        const where = {};
        if (search)
            where['client_name'] = (0, typeorm_1.ILike)(`%${search}%`);
        if (entity)
            where['entity'] = entity;
        const [clients, total] = await this.repo.findAndCount({
            where,
            order: { client_name: 'ASC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { clients: clients, total };
    }
};
exports.ClientRepository = ClientRepository;
exports.ClientRepository = ClientRepository = __decorate([
    (0, inversify_1.injectable)()
], ClientRepository);
//# sourceMappingURL=client.repository.js.map