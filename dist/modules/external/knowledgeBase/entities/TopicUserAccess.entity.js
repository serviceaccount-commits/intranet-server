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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicUserAccess = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const Topic_entity_1 = require("./Topic.entity");
/**
 * Staff allowed to see a restricted KB folder. A folder with no rows here is
 * unrestricted (visible to whoever has access to its client).
 */
let TopicUserAccess = class TopicUserAccess {
    topic_id;
    user_id;
    topic;
    user;
    created_at;
};
exports.TopicUserAccess = TopicUserAccess;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], TopicUserAccess.prototype, "topic_id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], TopicUserAccess.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Topic_entity_1.Topic, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'topic_id' }),
    __metadata("design:type", Topic_entity_1.Topic)
], TopicUserAccess.prototype, "topic", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_entity_1.User)
], TopicUserAccess.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], TopicUserAccess.prototype, "created_at", void 0);
exports.TopicUserAccess = TopicUserAccess = __decorate([
    (0, typeorm_1.Entity)('topic_user_access')
], TopicUserAccess);
//# sourceMappingURL=TopicUserAccess.entity.js.map