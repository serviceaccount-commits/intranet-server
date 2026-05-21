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
exports.TagService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const ConflictError_1 = require("../../../../shared/errors/ConflictError");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
let TagService = class TagService {
    tagRepository;
    constructor(tagRepository) {
        this.tagRepository = tagRepository;
    }
    async createTag(tagName) {
        const existing = await this.tagRepository.findByName(tagName);
        if (existing) {
            throw new ConflictError_1.ConflictError(`Tag "${tagName}" already exists.`);
        }
        return this.tagRepository.create({ tag_name: tagName });
    }
    async getTags() {
        return this.tagRepository.findAll();
    }
    async getTagById(tagId) {
        const tag = await this.tagRepository.findById(tagId);
        if (!tag)
            throw new NotFoundError_1.NotFoundError('Tag', tagId);
        return tag;
    }
};
exports.TagService = TagService;
exports.TagService = TagService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ITagRepository)),
    __metadata("design:paramtypes", [Object])
], TagService);
//# sourceMappingURL=tag.service.js.map