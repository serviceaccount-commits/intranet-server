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
exports.ArticleLockService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const kb_constants_1 = require("../kb.constants");
let ArticleLockService = class ArticleLockService {
    articleRepository;
    constructor(articleRepository) {
        this.articleRepository = articleRepository;
    }
    async startArticleEdit(userId, versionId) {
        const lockInfo = await this.articleRepository.getLockInfo(versionId);
        if (!lockInfo)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        const now = new Date();
        if (lockInfo.locked_by_user_id && lockInfo.lock_expires_at && lockInfo.lock_expires_at > now) {
            throw new BusinessLogicError_1.BusinessLogicError('Article is currently being edited by another user.');
        }
        const expiresAt = new Date(now.getTime() + kb_constants_1.ARTICLE_LOCK_DURATION_MS);
        await this.articleRepository.acquireLock(versionId, userId, expiresAt);
    }
    async refreshEditLock(userId, versionId) {
        const lockInfo = await this.articleRepository.getLockInfo(versionId);
        if (!lockInfo)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        if (lockInfo.locked_by_user_id && lockInfo.locked_by_user_id !== userId) {
            throw new BusinessLogicError_1.BusinessLogicError('You do not own this lock.');
        }
        const expiresAt = new Date(Date.now() + kb_constants_1.ARTICLE_LOCK_DURATION_MS);
        await this.articleRepository.refreshLock(versionId, expiresAt);
    }
    async closeArticleEdit(userId, versionId) {
        const lockInfo = await this.articleRepository.getLockInfo(versionId);
        if (!lockInfo)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        if (lockInfo.locked_by_user_id && lockInfo.locked_by_user_id !== userId) {
            throw new BusinessLogicError_1.BusinessLogicError('You do not own this lock.');
        }
        await this.articleRepository.releaseLock(versionId);
    }
    async releaseAllArticleLocks() {
        await this.articleRepository.releaseAllLocks();
    }
    async getArticleLockInfo(versionId) {
        const lockInfo = await this.articleRepository.getLockInfo(versionId);
        if (!lockInfo)
            throw new NotFoundError_1.NotFoundError('Article', versionId);
        return lockInfo;
    }
};
exports.ArticleLockService = ArticleLockService;
exports.ArticleLockService = ArticleLockService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleRepository)),
    __metadata("design:paramtypes", [Object])
], ArticleLockService);
//# sourceMappingURL=article-lock.service.js.map