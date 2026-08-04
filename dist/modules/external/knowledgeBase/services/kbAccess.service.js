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
exports.KbAccessService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const ActionNotAllowedError_1 = require("../../../../shared/errors/ActionNotAllowedError");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
/**
 * Users holding this permission (KB managers) bypass per-client scoping and
 * see every client's content — mirroring the client management screens they
 * already control. Everyone else is limited to the clients granted to them in
 * the `user_clients` access table (the same source the KB sidebar tree uses).
 */
const KB_PERM_CLIENT_MANAGE = 'kb:client:manage';
/**
 * Per-user read scoping for the internal (staff, JWT) Knowledge Base routes.
 *
 * Historically only the sidebar tree respected `user_clients`; the article
 * list/detail/search endpoints returned every client's content to any
 * authenticated staff user. This service centralizes the checks so ALL read
 * paths enforce the same rule: a user only consumes what they were assigned.
 *
 * The external/portal routes (API-key) are NOT run through this — the portal
 * backend enforces its own per-user kbPrefix scoping and the external service
 * methods already validate article/topic ↔ client consistency.
 */
let KbAccessService = class KbAccessService {
    clientRepository;
    topicRepository;
    userRepository;
    constructor(clientRepository, topicRepository, userRepository) {
        this.clientRepository = clientRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
    }
    async hasFullAccess(userId) {
        const user = await this.userRepository.findUserByIdWithPermissions(userId);
        return (user?.role?.permissions?.some((p) => p.permission_id === KB_PERM_CLIENT_MANAGE) ?? false);
    }
    /** Client ids the user may read, or `null` when unrestricted (KB manager). */
    async accessibleClientIds(userId) {
        if (await this.hasFullAccess(userId))
            return null;
        const clients = await this.clientRepository.findAllWithUserId(userId);
        return new Set(clients.map((c) => c.client_id));
    }
    /** Topic ids the user may read, or `null` when unrestricted. */
    async accessibleTopicIds(userId) {
        const clientIds = await this.accessibleClientIds(userId);
        if (clientIds === null)
            return null;
        if (clientIds.size === 0)
            return [];
        const topics = await this.topicRepository.findAllByClientIds([
            ...clientIds,
        ]);
        return topics.map((t) => t.topic_id);
    }
    async assertClientAccess(userId, clientId) {
        const clientIds = await this.accessibleClientIds(userId);
        if (clientIds === null)
            return;
        if (!clientIds.has(clientId)) {
            throw new ActionNotAllowedError_1.ActionNotAllowedError('You do not have access to this client’s knowledge base.');
        }
    }
    /** Resolves the topic and asserts access to its owning client. */
    async assertTopicAccess(userId, topicId) {
        const topic = await this.topicRepository.findById(topicId);
        if (!topic)
            throw new NotFoundError_1.NotFoundError('Topic', topicId);
        await this.assertClientAccess(userId, topic.client_id);
        return topic;
    }
};
exports.KbAccessService = KbAccessService;
exports.KbAccessService = KbAccessService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IClientRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.ITopicRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], KbAccessService);
//# sourceMappingURL=kbAccess.service.js.map