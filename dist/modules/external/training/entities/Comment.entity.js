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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const typeorm_1 = require("typeorm");
const Class_entity_1 = require("./Class.entity");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const uuid_1 = require("uuid");
let Comment = class Comment extends typeorm_1.BaseEntity {
    comment_id;
    comment_content;
    comment_status;
    user;
    user_id;
    class;
    class_id;
    createdAt;
    updatedAt;
    addId() {
        this.comment_id = (0, uuid_1.v4)();
    }
};
exports.Comment = Comment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Comment.prototype, "comment_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Comment.prototype, "comment_content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.ACTIVE, ES_1.default.INACTIVE],
        default: ES_1.default.ACTIVE,
    }),
    __metadata("design:type", String)
], Comment.prototype, "comment_status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], Comment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Comment.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Class_entity_1.Class),
    (0, typeorm_1.JoinColumn)({ name: 'class_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Class_entity_1.Class)
], Comment.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Comment.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Comment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Comment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Comment.prototype, "addId", null);
exports.Comment = Comment = __decorate([
    (0, typeorm_1.Entity)('comments')
], Comment);
//# sourceMappingURL=Comment.entity.js.map