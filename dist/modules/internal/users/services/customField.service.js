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
exports.CustomFieldService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const data_source_1 = require("../../../../shared/database/data-source");
const CustomField_entity_1 = require("../entities/CustomField.entity");
const UserCustomFieldValue_entity_1 = require("../entities/UserCustomFieldValue.entity");
let CustomFieldService = class CustomFieldService {
    customFieldRepository;
    userRepository;
    staffDirectoryOrderService;
    constructor(customFieldRepository, userRepository, staffDirectoryOrderService) {
        this.customFieldRepository = customFieldRepository;
        this.userRepository = userRepository;
        this.staffDirectoryOrderService = staffDirectoryOrderService;
    }
    async createCustomField(fieldName, dataType, visibility, status, order) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const existingCustomField = await this.customFieldRepository.findByName(fieldName);
            if (existingCustomField) {
                throw new Error('Custom field already exists');
            }
            const newCustomField = new CustomField_entity_1.CustomField();
            newCustomField.field_name = fieldName;
            newCustomField.data_type = dataType;
            newCustomField.visibility = visibility;
            newCustomField.status = status;
            let customField = await this.customFieldRepository.create(newCustomField);
            const users = await this.userRepository.findAllUsers();
            const userFieldValues = users.map((user) => {
                const userFieldValue = new UserCustomFieldValue_entity_1.UserCustomFieldValue();
                userFieldValue.user = user;
                userFieldValue.user_id = user.user_id;
                userFieldValue.field = customField;
                userFieldValue.field_id = customField.field_id;
                userFieldValue.value = '';
                return userFieldValue;
            });
            await this.customFieldRepository.createUserFieldValue(userFieldValues);
            await this.staffDirectoryOrderService.createStaffDirectoryOrder(order, fieldName, true);
            return customField;
        });
    }
    async getCustomFields() {
        return await this.customFieldRepository.findAll();
    }
    async getCustomFieldById(id) {
        const customField = await this.customFieldRepository.findById(id);
        if (!customField) {
            throw new Error(`Custom field with id ${id} not found`);
        }
        return customField;
    }
    async deleteCustomField(customFieldId) {
        await this.customFieldRepository.delete(customFieldId);
    }
};
exports.CustomFieldService = CustomFieldService;
exports.CustomFieldService = CustomFieldService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ICustomFieldRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IStaffDirectoryOrderService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], CustomFieldService);
//# sourceMappingURL=customField.service.js.map