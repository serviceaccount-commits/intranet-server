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
exports.ArticleVersion = void 0;
const typeorm_1 = require("typeorm");
const ArticleChunk_entity_1 = require("./ArticleChunk.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const Document_entity_1 = require("../../../internal/documents/entities/Document.entity");
const Article_entity_1 = require("./Article.entity");
const Tag_entity_1 = require("./Tag.entity");
const uuid_1 = require("uuid");
let ArticleVersion = class ArticleVersion extends typeorm_1.BaseEntity {
    article_version_id;
    article_name;
    article_synopsis;
    locked_by_user_id;
    lock_expires_at;
    chunks;
    article_status;
    version;
    user;
    user_id;
    user_update;
    user_update_id;
    user_publish;
    user_publish_id;
    document;
    document_id;
    article;
    article_id;
    tags;
    createdAt;
    updatedAt;
    published_at;
    addId() {
        this.article_version_id = (0, uuid_1.v4)();
    }
};
exports.ArticleVersion = ArticleVersion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ArticleVersion.prototype, "article_version_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ArticleVersion.prototype, "article_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], ArticleVersion.prototype, "article_synopsis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true, default: null }),
    __metadata("design:type", Object)
], ArticleVersion.prototype, "locked_by_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, default: null }),
    __metadata("design:type", Object)
], ArticleVersion.prototype, "lock_expires_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ArticleChunk_entity_1.ArticleChunk, (chunk) => chunk.articleVersion),
    __metadata("design:type", Array)
], ArticleVersion.prototype, "chunks", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.PUBLISHED, ES_1.default.DRAFT, ES_1.default.OUTDATED, ES_1.default.UNPUBLISHED],
        default: ES_1.default.DRAFT,
    }),
    __metadata("design:type", String)
], ArticleVersion.prototype, "article_status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ArticleVersion.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], ArticleVersion.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ArticleVersion.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_update_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], ArticleVersion.prototype, "user_update", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ArticleVersion.prototype, "user_update_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_publish_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], ArticleVersion.prototype, "user_publish", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ArticleVersion.prototype, "user_publish_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Document_entity_1.Document),
    (0, typeorm_1.JoinColumn)({ name: 'document_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Document_entity_1.Document)
], ArticleVersion.prototype, "document", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ArticleVersion.prototype, "document_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_entity_1.Article),
    (0, typeorm_1.JoinColumn)({ name: 'article_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Article_entity_1.Article)
], ArticleVersion.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ArticleVersion.prototype, "article_id", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Tag_entity_1.Tag, (tag) => tag.articles),
    (0, typeorm_1.JoinTable)({
        name: 'article_version_tags',
        joinColumn: {
            name: 'article_version_id',
            referencedColumnName: 'article_version_id',
        },
        inverseJoinColumn: {
            name: 'tag_id',
            referencedColumnName: 'tag_id',
        },
    }),
    __metadata("design:type", Array)
], ArticleVersion.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ArticleVersion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ArticleVersion.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], ArticleVersion.prototype, "published_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ArticleVersion.prototype, "addId", null);
exports.ArticleVersion = ArticleVersion = __decorate([
    (0, typeorm_1.Entity)('article_versions')
], ArticleVersion);
//# sourceMappingURL=ArticleVersion.entity.js.map