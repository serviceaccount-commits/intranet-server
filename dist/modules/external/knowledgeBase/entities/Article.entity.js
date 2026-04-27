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
exports.Article = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const ArticleVersion_entity_1 = require("./ArticleVersion.entity");
const Topic_entity_1 = require("./Topic.entity");
let Article = class Article extends typeorm_1.BaseEntity {
    article_id;
    user;
    user_id;
    topic;
    topic_id;
    articles;
    locked_by_user_id;
    lock_expires_at;
    createdAt;
    updatedAt;
    available_for_client;
    addId() {
        this.article_id = (0, uuid_1.v4)();
    }
};
exports.Article = Article;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Article.prototype, "article_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_entity_1.User)
], Article.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Article.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Topic_entity_1.Topic),
    (0, typeorm_1.JoinColumn)({ name: 'topic_id' }),
    __metadata("design:type", Topic_entity_1.Topic)
], Article.prototype, "topic", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Article.prototype, "topic_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ArticleVersion_entity_1.ArticleVersion, 'article'),
    __metadata("design:type", Array)
], Article.prototype, "articles", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, default: null }),
    __metadata("design:type", Object)
], Article.prototype, "locked_by_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, default: null }),
    __metadata("design:type", Object)
], Article.prototype, "lock_expires_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Article.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Article.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Article.prototype, "available_for_client", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Article.prototype, "addId", null);
exports.Article = Article = __decorate([
    (0, typeorm_1.Entity)('articles')
], Article);
//# sourceMappingURL=Article.entity.js.map