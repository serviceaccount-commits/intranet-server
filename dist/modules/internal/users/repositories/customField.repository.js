"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomFieldRepository = void 0;
const inversify_1 = require("inversify");
const CustomField_entity_1 = require("../entities/CustomField.entity");
const data_source_1 = require("../../../../shared/database/data-source");
let CustomFieldRepository = class CustomFieldRepository {
    async create(customField) {
        return await data_source_1.AppDataSource.manager.save(customField);
    }
    async createUserFieldValue(userFieldValue) {
        await data_source_1.AppDataSource.manager.save(userFieldValue);
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(CustomField_entity_1.CustomField);
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(CustomField_entity_1.CustomField, {
            where: { field_id: id },
        });
    }
    async findByName(name) {
        return await data_source_1.AppDataSource.manager.findOne(CustomField_entity_1.CustomField, {
            where: { field_name: name },
        });
    }
    async delete(customFieldId) {
        const customField = await this.findById(customFieldId);
        if (!customField) {
            throw new Error(`Custom field with id ${customFieldId} not found`);
        }
        await data_source_1.AppDataSource.manager.remove(customField);
    }
};
exports.CustomFieldRepository = CustomFieldRepository;
exports.CustomFieldRepository = CustomFieldRepository = __decorate([
    (0, inversify_1.injectable)()
], CustomFieldRepository);
//# sourceMappingURL=customField.repository.js.map