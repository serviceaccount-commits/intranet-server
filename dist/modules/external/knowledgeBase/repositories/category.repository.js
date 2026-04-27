"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const Category_entity_1 = require("../entities/Category.entity");
let CategoryRepository = class CategoryRepository {
    async create(category, client, user) {
        category.client = client;
        category.client_id = client.client_id;
        category.user = user;
        category.user_id = user.user_id;
        return await data_source_1.AppDataSource.manager.save(category);
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(Category_entity_1.Category);
    }
    async findAllByClientId(clientId) {
        return await data_source_1.AppDataSource.manager.find(Category_entity_1.Category, {
            where: {
                client_id: clientId,
            },
        });
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(Category_entity_1.Category, {
            where: {
                category_id: id,
            },
        });
    }
    async findByName(categoryName) {
        return await data_source_1.AppDataSource.manager.findOne(Category_entity_1.Category, {
            where: {
                category_name: categoryName,
            },
        });
    }
    async save(category) {
        return await data_source_1.AppDataSource.manager.save(category);
    }
};
exports.CategoryRepository = CategoryRepository;
exports.CategoryRepository = CategoryRepository = __decorate([
    (0, inversify_1.injectable)()
], CategoryRepository);
//# sourceMappingURL=category.repository.js.map