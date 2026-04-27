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
exports.ExamController = void 0;
const inversify_1 = require("inversify");
const zod_1 = require("zod");
const AppError_1 = require("../../../../shared/errors/AppError");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
let ExamController = class ExamController {
    examService;
    constructor(examService) {
        this.examService = examService;
    }
    async createExam(req, res, next) {
        try {
            const input = req.body;
            const exam = await this.examService.createExam(input);
            res.status(201).json(exam);
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
    async updateExam(req, res, next) {
        try {
            const input = req.body;
            const { examId } = req.params;
            if (!examId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.updateExam(examId, input);
            res.status(200).json(exam);
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
    async deleteExam(req, res, next) {
        try {
            const { examId } = req.params;
            if (!examId) {
                res.status(400);
                return;
            }
            await this.examService.deleteExam(examId);
            res.status(200).json({ message: 'Option deleted successfully' });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async getLatestExamVersion(req, res, next) {
        try {
            const { classId } = req.params;
            if (!classId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.getLatestExamVersion(classId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async getAdminExam(req, res, next) {
        try {
            const { examId } = req.params;
            if (!examId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.getAdminExam(examId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async getAllClassExams(req, res, next) {
        try {
            const { classId } = req.params;
            if (!classId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.getAllClassExams(classId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async getAllClassExamsMetadataOnly(req, res, next) {
        try {
            const { classId } = req.params;
            if (!classId) {
                res.status(400);
                return;
            }
            const exams = await this.examService.getAllClassExamsMetadataOnly(classId);
            res.status(200).json(exams);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async createStandaloneExam(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.createStandaloneExam(userId);
            res.status(201).json(exam);
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
    async getStandaloneExam(req, res, next) {
        try {
            const { standaloneExamId } = req.params;
            if (!standaloneExamId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.getStandaloneExam(standaloneExamId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async getStandaloneExamMetadata(req, res, next) {
        try {
            const { standaloneExamId } = req.params;
            if (!standaloneExamId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.getStandaloneExamMetadata(standaloneExamId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async updateStandaloneExamName(req, res, next) {
        try {
            const { standaloneExamId } = req.params;
            const { examTitle } = req.body;
            if (!standaloneExamId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.updateStandaloneExamName(standaloneExamId, examTitle);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async getUserExam(req, res, next) {
        try {
            const userId = req.user?.id;
            const { classId } = req.params;
            if (!userId) {
                res.status(400);
                return;
            }
            if (!classId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.getUserExam(classId, userId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async getExamsDashboard(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.getExamsDashboard();
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async getUserExamAttempts(req, res, next) {
        try {
            const { examId } = req.params;
            const { userId } = req.params;
            if (!userId || !examId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.getUserExamAttempts(userId, examId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async getStandaloneExamsWaitingForApproval(_req, res, next) {
        try {
            const exam = await this.examService.getStandaloneExamsWaitingForApproval();
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async requestStandaloneExamApproval(req, res, next) {
        try {
            const { standaloneExamId } = req.params;
            if (!standaloneExamId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.requestStandaloneExamApproval(standaloneExamId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async approveStandaloneExam(req, res, next) {
        try {
            const { standaloneExamId } = req.params;
            if (!standaloneExamId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.approveStandaloneExam(standaloneExamId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
    async getMyStandaloneExams(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(400);
                return;
            }
            const exam = await this.examService.getMyStandaloneExams(userId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    }
};
exports.ExamController = ExamController;
exports.ExamController = ExamController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamService)),
    __metadata("design:paramtypes", [Object])
], ExamController);
//# sourceMappingURL=exams.controller.js.map