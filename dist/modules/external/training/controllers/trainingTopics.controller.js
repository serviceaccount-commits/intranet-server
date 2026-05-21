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
exports.TrainingTopicController = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const zod_1 = require("zod");
const AppError_1 = require("../../../../shared/errors/AppError");
let TrainingTopicController = class TrainingTopicController {
    trainingTopicService;
    constructor(trainingTopicService) {
        this.trainingTopicService = trainingTopicService;
    }
    async createTopic(req, res, next) {
        try {
            const input = req.body;
            const course = await this.trainingTopicService.createTopic(input);
            res.status(201).json(course);
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
    async updateTopic(req, res, next) {
        try {
            const { topicId } = req.params;
            const input = req.body;
            if (!topicId) {
                res.sendStatus(400);
                return;
            }
            await this.trainingTopicService.updateTopic(topicId, input);
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
    async getTopics(req, res) {
        const { courseId } = req.params;
        if (!courseId) {
            res.sendStatus(400);
            return;
        }
        const courses = await this.trainingTopicService.getTopics(courseId);
        res.json(courses);
    }
    async getTopicById(req, res) {
        const { topicId } = req.params;
        if (!topicId) {
            res.sendStatus(400);
            return;
        }
        const topic = await this.trainingTopicService.getTopicById(topicId);
        res.json(topic);
    }
    async getPublishedClassesForUser(req, res, next) {
        try {
            const { topicId, userId } = req.params;
            if (!topicId || !userId) {
                res.sendStatus(400);
                return;
            }
            const classesWithStatus = await this.trainingTopicService.getPublishedClassesWithUserCompletionStatus(topicId, userId);
            res.status(200).json(classesWithStatus);
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
exports.TrainingTopicController = TrainingTopicController;
exports.TrainingTopicController = TrainingTopicController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ITrainingTopicService)),
    __metadata("design:paramtypes", [Object])
], TrainingTopicController);
//# sourceMappingURL=trainingTopics.controller.js.map