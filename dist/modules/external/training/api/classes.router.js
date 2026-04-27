"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const classes_controller_1 = require("../controllers/classes.controller");
const classController = inversify_config_1.container.get(classes_controller_1.ClassController);
const classRouter = (0, express_1.Router)();
exports.classRouter = classRouter;
classRouter.post('/', async (req, res, next) => {
    try {
        await classController.createClass(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
classRouter.get('/topic/:topicId', async (req, res, next) => {
    try {
        await classController.getClasses(req, res);
    }
    catch (error) {
        next(error);
    }
});
classRouter.get('/:classId', async (req, res, next) => {
    try {
        await classController.getClassById(req, res);
    }
    catch (error) {
        next(error);
    }
});
classRouter.get('/:classId/user', async (req, res, next) => {
    try {
        await classController.getClassByIdWithUserValue(req, res);
    }
    catch (error) {
        next(error);
    }
});
classRouter.put('/:classId', async (req, res, next) => {
    try {
        await classController.updateClass(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
classRouter.put('/:classId/user', async (req, res, next) => {
    try {
        await classController.updateClassUserValue(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
// COMMENTS
classRouter.post('/comments/:classId', async (req, res, next) => {
    try {
        await classController.addCommentToClass(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
classRouter.get('/:classId/comments', async (req, res, next) => {
    try {
        await classController.getComments(req, res);
    }
    catch (error) {
        next(error);
    }
});
classRouter.get('/:classId/comments/active', async (req, res, next) => {
    try {
        await classController.getActiveComments(req, res);
    }
    catch (error) {
        next(error);
    }
});
classRouter.get('/comments/:commentId', async (req, res, next) => {
    try {
        await classController.getCommentById(req, res);
    }
    catch (error) {
        next(error);
    }
});
classRouter.put('/comments/:commentId', async (req, res, next) => {
    try {
        await classController.updateComment(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=classes.router.js.map