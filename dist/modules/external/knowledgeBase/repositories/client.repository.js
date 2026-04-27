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
const Client_entity_1 = require("../entities/Client.entity");
const data_source_1 = require("../../../../shared/database/data-source");
const typeorm_1 = require("typeorm");
let ClientRepository = class ClientRepository {
    async create(client, user) {
        client.user = user;
        client.user_id = user.user_id;
        return await data_source_1.AppDataSource.manager.save(client);
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(Client_entity_1.Client);
    }
    async findAllByRegionOrdered(region) {
        return await data_source_1.AppDataSource.manager.find(Client_entity_1.Client, {
            where: {
                region: region,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async findAllWithUserId(userId) {
        return await data_source_1.AppDataSource.manager.find(Client_entity_1.Client, {
            where: {
                users: { user_id: userId },
            },
        });
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(Client_entity_1.Client, {
            where: {
                client_id: id,
            },
        });
    }
    async findByIds(ids) {
        if (!ids || ids.length === 0)
            return [];
        return await data_source_1.AppDataSource.manager.find(Client_entity_1.Client, {
            where: {
                client_id: (0, typeorm_1.In)(ids),
            },
        });
    }
    async findBySharedId(sharedId) {
        return await data_source_1.AppDataSource.manager.findOne(Client_entity_1.Client, {
            where: {
                client_shared_id: sharedId,
            },
        });
    }
    async findIMClient() {
        return await data_source_1.AppDataSource.manager.findOne(Client_entity_1.Client, {
            where: {
                is_im: true,
            },
        });
    }
    async findFLXClient() {
        return await data_source_1.AppDataSource.manager.findOne(Client_entity_1.Client, {
            where: {
                is_flx: true,
            },
        });
    }
    async findByName(clientName) {
        return await data_source_1.AppDataSource.manager.findOne(Client_entity_1.Client, {
            where: {
                client_name: clientName,
            },
        });
    }
    async save(client) {
        return await data_source_1.AppDataSource.manager.save(client);
    }
    async findAndCountAllFiltered(input) {
        const { page, limit, search, entity } = input;
        const queryBuilder = data_source_1.AppDataSource.manager.createQueryBuilder(Client_entity_1.Client, 'client');
        if (entity) {
            queryBuilder.andWhere('client.entity = :entity', { entity });
        }
        if (search) {
            queryBuilder.orWhere('client.client_name ILIKE :search', {
                search: `%${search}%`,
            });
            queryBuilder.orWhere('client.primary_contact_name ILIKE :search', {
                search: `%${search}%`,
            });
            queryBuilder.orWhere('client.primary_contact_email ILIKE :search', {
                search: `%${search}%`,
            });
            queryBuilder.orWhere('client.primary_contact_phone ILIKE :search', {
                search: `%${search}%`,
            });
            queryBuilder.orWhere('client.address ILIKE :search', {
                search: `%${search}%`,
            });
        }
        const [clients, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { clients, total };
    }
};
exports.ClientRepository = ClientRepository;
exports.ClientRepository = ClientRepository = __decorate([
    (0, inversify_1.injectable)()
], ClientRepository);
//# sourceMappingURL=client.repository.js.map