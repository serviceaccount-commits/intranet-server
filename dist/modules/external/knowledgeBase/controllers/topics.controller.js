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
exports.TopicController = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
let TopicController = class TopicController {
    topicService;
    constructor(topicService) {
        this.topicService = topicService;
    }
    async createTopic(req, res) {
        //! should update userId so that it gets retrieved via jwt cookie
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        const input = req.body;
        input.userId = userId;
        const topic = await this.topicService.createTopic(input);
        return res.json(topic);
    }
    async getTopics(req, res) {
        const { clientId } = req.params;
        if (!clientId) {
            res.sendStatus(400);
            return;
        }
        const topics = await this.topicService.getTopics(clientId);
        return res.json(topics);
    }
    async getTopicById(req, res) {
        const { topicId } = req.params;
        if (!topicId) {
            res.sendStatus(400);
            return;
        }
        const topic = await this.topicService.getTopicById(topicId);
        return res.json(topic);
    }
};
exports.TopicController = TopicController;
exports.TopicController = TopicController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ITopicService)),
    __metadata("design:paramtypes", [Object])
], TopicController);
//# sourceMappingURL=topics.controller.js.map