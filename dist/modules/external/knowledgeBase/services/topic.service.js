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
const ValidationError_1 = require("../../../../shared/errors/ValidationError");
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
        // When a parent is given, validate that it belongs to the same client so
        // folders never get tangled across tenants.
        if (data.parentTopicId) {
            const parent = await this.topicRepository.findById(data.parentTopicId);
            if (!parent)
                throw new NotFoundError_1.NotFoundError('Topic', data.parentTopicId);
            if (parent.client_id !== client.client_id) {
                throw new ValidationError_1.ValidationError('Parent folder belongs to a different client.');
            }
        }
        return this.topicRepository.create({
            topic_name: data.topicName,
            topic_edit_available: true,
            client_id: client.client_id,
            parent_topic_id: data.parentTopicId ?? null,
            user_id: data.userId,
        });
    }
    async updateTopic(input) {
        const data = UpdateTopicSchema_1.UpdateTopicSchema.parse(input);
        const topic = await this.topicRepository.findById(data.topicId);
        if (!topic)
            throw new NotFoundError_1.NotFoundError('Topic', data.topicId);
        if (data.topicName !== undefined) {
            topic.topic_name = data.topicName;
        }
        // `parentTopicId` is only checked when the key is present in the payload.
        // Sending `null` explicitly means "promote to root of the client".
        if (Object.prototype.hasOwnProperty.call(data, 'parentTopicId')) {
            const newParentId = data.parentTopicId ?? null;
            if (newParentId === topic.topic_id) {
                throw new ValidationError_1.ValidationError('A folder cannot be its own parent.');
            }
            if (newParentId !== null) {
                const parent = await this.topicRepository.findById(newParentId);
                if (!parent)
                    throw new NotFoundError_1.NotFoundError('Topic', newParentId);
                if (parent.client_id !== topic.client_id) {
                    throw new ValidationError_1.ValidationError('Parent folder belongs to a different client.');
                }
                // Reject if the candidate parent is one of this topic's descendants:
                // that would create a cycle.
                const descendantIds = await this.topicRepository.findAllDescendantIds(topic.topic_id);
                if (descendantIds.includes(newParentId)) {
                    throw new ValidationError_1.ValidationError('Cannot move a folder under one of its own descendants.');
                }
            }
            topic.parent_topic_id = newParentId;
        }
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