"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const tags_controller_1 = require("../controllers/tags.controller");
const tagController = inversify_config_1.container.get(tags_controller_1.TagController);
const tagsRouter = (0, express_1.Router)();
exports.tagsRouter = tagsRouter;
tagsRouter.post('/', async (req, res, next) => {
    try {
        await tagController.createTag(req, res);
    }
    catch (error) {
        next(error);
    }
});
tagsRouter.get('/', async (req, res, next) => {
    try {
        await tagController.getTags(req, res);
    }
    catch (error) {
        next(error);
    }
});
tagsRouter.get('/:tagId', async (req, res, next) => {
    try {
        await tagController.getTagById(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=tags.router.js.map