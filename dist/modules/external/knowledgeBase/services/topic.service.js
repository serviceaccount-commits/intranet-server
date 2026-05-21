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
exports.TopicService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const AuthenticationError_1 = require("../../../../shared/errors/AuthenticationError");
const CreateTopicSchema_1 = require("../schema/topics/CreateTopicSchema");
const UpdateTopicSchema_1 = require("../schema/topics/UpdateTopicSchema");
let TopicService = class TopicService {
    topicRepository;
    clientRepository;
    userRepository;
    constructor(topicRepository, clientRepository, userRepository) {
        this.topicRepository = topicRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
    }
    async createTopic(input) {
        const data = CreateTopicSchema_1.CreateTopicSchema.parse(input);
        if (!data.userId)
            throw new AuthenticationError_1.AuthenticationError('User not authenticated.');
        const user = await this.userRepository.findUserById(data.userId);
        if (!user)
            throw new NotFoundError_1.NotFoundError('User', data.userId);
        const client = await this.clientRepository.findById(data.clientId);
        if (!client)
            throw new NotFoundError_1.NotFoundError('Client', data.clientId);
        return this.topicRepository.create({
            topic_name: data.topicName,
            topic_edit_available: true,
            client_id: client.client_id,
            user_id: data.userId,
        });
    }
    async updateTopic(input) {
        const data = UpdateTopicSchema_1.UpdateTopicSchema.parse(input);
        const topic = await this.topicRepository.findById(data.topicId);
        if (!topic)
            throw new NotFoundError_1.NotFoundError('Topic', data.topicId);
        topic.topic_name = data.topicName;
        return this.topicRepository.save(topic);
    }
    async getTopics(clientId) {
        return this.topicRepository.findAllByClientId(clientId);
    }
    async getTopicById(topicId) {
        const topic = await this.topicRepository.findById(topicId);
        if (!topic)
            throw new NotFoundError_1.NotFoundError('Topic', topicId);
        return topic;
    }
};
exports.TopicService = TopicService;
exports.TopicService = TopicService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ITopicRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IClientRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], TopicService);
//# sourceMappingURL=topic.service.js.map