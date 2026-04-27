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
exports.ArticleChunk = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const ArticleVersion_entity_1 = require("./ArticleVersion.entity");
let ArticleChunk = class ArticleChunk {
    chunk_id;
    articleVersion;
    article_version_id;
    content;
    embedding;
    addId() {
        this.chunk_id = (0, uuid_1.v4)();
    }
};
exports.ArticleChunk = ArticleChunk;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ArticleChunk.prototype, "chunk_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ArticleVersion_entity_1.ArticleVersion, (article) => article.chunks),
    __metadata("design:type", ArticleVersion_entity_1.ArticleVersion)
], ArticleChunk.prototype, "articleVersion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ArticleChunk.prototype, "article_version_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ArticleChunk.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ArticleChunk.prototype, "embedding", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ArticleChunk.prototype, "addId", null);
exports.ArticleChunk = ArticleChunk = __decorate([
    (0, typeorm_1.Entity)('article_chunks')
], ArticleChunk);
//# sourceMappingURL=ArticleChunk.entity.js.map