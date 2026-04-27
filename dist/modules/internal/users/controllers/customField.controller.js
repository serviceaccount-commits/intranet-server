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
exports.CustomFieldController = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
let CustomFieldController = class CustomFieldController {
    customFieldService;
    constructor(customFieldService) {
        this.customFieldService = customFieldService;
    }
    async createCustomField(req, res) {
        try {
            const { fieldName, dataType, visibilty, status, order } = req.body;
            const customField = await this.customFieldService.createCustomField(fieldName, dataType, visibilty, status, order);
            res.status(201).json(customField);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async getCustomFields(_req, res) {
        const customFields = await this.customFieldService.getCustomFields();
        res.json(customFields);
    }
    async getCustomFieldById(req, res) {
        const { customFieldId } = req.params;
        if (!customFieldId) {
            return res.status(400);
        }
        const customField = await this.customFieldService.getCustomFieldById(customFieldId);
        return res.json(customField);
    }
    async deleteCustomField(customFieldId) {
        await this.customFieldService.deleteCustomField(customFieldId);
    }
};
exports.CustomFieldController = CustomFieldController;
exports.CustomFieldController = CustomFieldController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ICustomFieldService)),
    __metadata("design:paramtypes", [Object])
], CustomFieldController);
//# sourceMappingURL=customField.controller.js.map