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
exports.Topic = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const Client_entity_1 = require("./Client.entity");
let Topic = class Topic extends typeorm_1.BaseEntity {
    topic_id;
    topic_name;
    topic_edit_available;
    user;
    user_id;
    client;
    client_id;
    createdAt;
    updatedAt;
    addId() {
        this.topic_id = (0, uuid_1.v4)();
    }
};
exports.Topic = Topic;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Topic.prototype, "topic_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Topic.prototype, "topic_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Topic.prototype, "topic_edit_available", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_entity_1.User)
], Topic.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Topic.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_entity_1.Client),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", Client_entity_1.Client)
], Topic.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Topic.prototype, "client_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Topic.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Topic.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Topic.prototype, "addId", null);
exports.Topic = Topic = __decorate([
    (0, typeorm_1.Entity)('topics')
], Topic);
//# sourceMappingURL=Topic.entity.js.map