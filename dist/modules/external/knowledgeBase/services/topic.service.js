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
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const Topic_entity_1 = require("../entities/Topic.entity");
const CreateTopicSchema_1 = require("../schema/topics/CreateTopicSchema");
const UpdateTopicSchema_1 = require("../schema/topics/UpdateTopicSchema");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const AuthenticationError_1 = require("../../../../shared/errors/AuthenticationError");
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
        const validatedData = CreateTopicSchema_1.CreateTopicSchema.parse(input);
        const userId = validatedData.userId;
        if (!userId) {
            throw new AuthenticationError_1.AuthenticationError('User not authenticated.');
        }
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new NotFoundError_1.NotFoundError('User', validatedData.userId);
            }
            const existingClient = await this.clientRepository.findById(validatedData.clientId);
            if (!existingClient) {
                throw new NotFoundError_1.NotFoundError('Client', validatedData.clientId);
            }
            const newTopic = new Topic_entity_1.Topic();
            newTopic.topic_name = validatedData.topicName;
            return await this.topicRepository.create(newTopic, existingClient, user);
        });
    }
    async updateTopic(input) {
        const validatedData = UpdateTopicSchema_1.UpdateTopicSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const topic = await this.topicRepository.findById(validatedData.topicId);
            if (!topic) {
                throw new NotFoundError_1.NotFoundError('Topic', validatedData.topicId);
            }
            topic.topic_name = validatedData.topicName;
            return await this.topicRepository.save(topic);
        });
    }
    async getTopics(clientId) {
        return await this.topicRepository.findAllByClientId(clientId);
    }
    async getTopicById(topicId) {
        const topic = await this.topicRepository.findById(topicId);
        if (!topic) {
            throw new Error(`Topic with id ${topicId} does not exist.`);
        }
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