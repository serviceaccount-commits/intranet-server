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
exports.TagController = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
let TagController = class TagController {
    tagService;
    constructor(tagService) {
        this.tagService = tagService;
    }
    async createTag(req, res) {
        //! should update userId so that it gets retrieved via jwt cookie
        let { tagName } = req.body;
        const tag = await this.tagService.createTag(tagName);
        return res.json(tag);
    }
    async getTags(_req, res) {
        const tags = await this.tagService.getTags();
        return res.json(tags);
    }
    async getTagById(req, res) {
        const { tagId } = req.params;
        if (!tagId) {
            res.sendStatus(400);
            return;
        }
        const tag = await this.tagService.getTagById(parseInt(tagId));
        return res.json(tag);
    }
};
exports.TagController = TagController;
exports.TagController = TagController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ITagService)),
    __metadata("design:paramtypes", [Object])
], TagController);
//# sourceMappingURL=tags.controller.js.map