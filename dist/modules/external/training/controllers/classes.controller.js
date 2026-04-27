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
exports.ClassController = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const zod_1 = require("zod");
const AppError_1 = require("../../../../shared/errors/AppError");
let ClassController = class ClassController {
    classService;
    constructor(classService) {
        this.classService = classService;
    }
    async createClass(req, res, next) {
        try {
            const input = req.body;
            const userId = req.user?.id;
            if (!userId) {
                res.status(400);
                return;
            }
            input.userId = userId;
            const trainingClass = await this.classService.createClass(input);
            res.status(201).json(trainingClass);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error });
            }
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    async updateClass(req, res, next) {
        try {
            const { classId } = req.params;
            const input = req.body;
            if (!classId) {
                res.sendStatus(400);
                return;
            }
            await this.classService.updateClass(classId, input);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error });
            }
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    async updateClassUserValue(req, res, next) {
        try {
            const { classId } = req.params;
            const userId = req.user?.id;
            const { completionStatus } = req.body;
            if (!classId || !userId || !completionStatus) {
                res.sendStatus(400);
                return;
            }
            await this.classService.updateClassUserValue(classId, userId, completionStatus);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error });
            }
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    async getClasses(req, res) {
        const { topicId } = req.params;
        if (!topicId) {
            res.sendStatus(400);
            return;
        }
        const classes = await this.classService.getClasses(topicId);
        res.json(classes);
    }
    async getClassById(req, res) {
        const { classId } = req.params;
        if (!classId) {
            res.sendStatus(400);
            return;
        }
        const classEntity = await this.classService.getClassById(classId);
        res.json(classEntity);
    }
    async getClassByIdWithUserValue(req, res) {
        const { classId } = req.params;
        const userId = req.user?.id;
        if (!classId || !userId) {
            res.sendStatus(400);
            return;
        }
        const data = await this.classService.getClassByIdWithUserValueAndExam(classId, userId);
        res.json(data);
    }
    async addCommentToClass(req, res, next) {
        try {
            const { classId } = req.params;
            const input = req.body;
            if (!classId) {
                res.sendStatus(400);
                return;
            }
            const classEntity = await this.classService.addCommentToClass(classId, input);
            res.status(201).json(classEntity);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error });
            }
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    async getComments(req, res) {
        const { classId } = req.params;
        if (!classId) {
            res.sendStatus(400);
            return;
        }
        const comments = await this.classService.getComments(classId);
        res.json(comments);
    }
    async getActiveComments(req, res) {
        const { classId } = req.params;
        if (!classId) {
            res.sendStatus(400);
            return;
        }
        const comments = await this.classService.getClassActiveComments(classId);
        res.json(comments);
    }
    async getCommentById(req, res) {
        const { commentId } = req.params;
        if (!commentId) {
            res.sendStatus(400);
            return;
        }
        const comment = await this.classService.getCommentById(commentId);
        res.json(comment);
    }
    async updateComment(req, res, next) {
        try {
            const { commentId } = req.params;
            const input = req.body;
            if (!commentId) {
                res.sendStatus(400);
                return;
            }
            await this.classService.updateComment(commentId, input);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error });
            }
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
};
exports.ClassController = ClassController;
exports.ClassController = ClassController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassService)),
    __metadata("design:paramtypes", [Object])
], ClassController);
//# sourceMappingURL=classes.controller.js.map