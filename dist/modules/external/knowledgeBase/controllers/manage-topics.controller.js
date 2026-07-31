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
exports.ManageTopicsController = void 0;
const inversify_1 = require("inversify");
const zod_1 = require("zod");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const ValidationError_1 = require("../../../../shared/errors/ValidationError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
/**
 * Folder (topic) write endpoints consumed by the client portal's BACKEND
 * (server-to-server, authenticated with INTERNAL_WRITE_API_KEY). The portal
 * backend authenticates its own users and scopes them to their clientSharedId
 * before calling here.
 */
let ManageTopicsController = class ManageTopicsController {
    topicService;
    constructor(topicService) {
        this.topicService = topicService;
    }
    async createTopic(req, res) {
        const { clientSharedId } = req.params;
        if (!clientSharedId) {
            res.sendStatus(400);
            return;
        }
        try {
            const topic = await this.topicService.createManagedTopic(clientSharedId, req.body);
            res.status(201).json(topic);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async updateTopic(req, res) {
        const { clientSharedId, topicId } = req.params;
        if (!clientSharedId || !topicId) {
            res.sendStatus(400);
            return;
        }
        try {
            const topic = await this.topicService.updateManagedTopic(clientSharedId, topicId, req.body);
            res.json(topic);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    handleError(error, res) {
        if (error instanceof NotFoundError_1.NotFoundError) {
            res.status(404).json({ message: error.message });
            return;
        }
        if (error instanceof ValidationError_1.ValidationError) {
            res.status(400).json({ message: error.message });
            return;
        }
        if (error instanceof BusinessLogicError_1.BusinessLogicError) {
            res.status(409).json({ message: error.message });
            return;
        }
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({ message: 'Validation failed', issues: error.issues });
            return;
        }
        res.status(400).json({
            message: error instanceof Error ? error.message : 'Unexpected error',
        });
    }
};
exports.ManageTopicsController = ManageTopicsController;
exports.ManageTopicsController = ManageTopicsController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ITopicService)),
    __metadata("design:paramtypes", [Object])
], ManageTopicsController);
//# sourceMappingURL=manage-topics.controller.js.map