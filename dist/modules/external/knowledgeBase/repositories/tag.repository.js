"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const Tag_entity_1 = require("../entities/Tag.entity");
const typeorm_1 = require("typeorm");
let TagRepository = class TagRepository {
    async create(tag) {
        return await data_source_1.AppDataSource.manager.save(tag);
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(Tag_entity_1.Tag);
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(Tag_entity_1.Tag, {
            where: {
                tag_id: id,
            },
        });
    }
    async findByIds(ids) {
        return await data_source_1.AppDataSource.manager.find(Tag_entity_1.Tag, {
            where: {
                tag_id: (0, typeorm_1.In)(ids),
            },
        });
    }
    async findByName(tagName) {
        return await data_source_1.AppDataSource.manager.findOne(Tag_entity_1.Tag, {
            where: {
                tag_name: tagName,
            },
        });
    }
};
exports.TagRepository = TagRepository;
exports.TagRepository = TagRepository = __decorate([
    (0, inversify_1.injectable)()
], TagRepository);
//# sourceMappingURL=tag.repository.js.map