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
    examAdminService;
    examStudentService;
    examStandaloneService;
    constructor(examAdminService, examStudentService, examStandaloneService) {
        this.examAdminService = examAdminService;
        this.examStudentService = examStudentService;
        this.examStandaloneService = examStandaloneService;
    }
    // ─── Admin ────────────────────────────────────────────────────────────────────
    async createExam(req, res, next) {
        try {
            const input = req.body;
            const exam = await this.examAdminService.createExam(input);
            res.status(201).json(exam);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError)
                return res.status(400).json({ error });
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async updateExam(req, res, next) {
        try {
            const input = req.body;
            const { examId } = req.params;
            if (!examId) {
                return res.sendStatus(400);
            }
            const exam = await this.examAdminService.updateExam(examId, input);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError)
                return res.status(400).json({ error });
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async deleteExam(req, res, next) {
        try {
            const { examId } = req.params;
            if (!examId) {
                return res.sendStatus(400);
            }
            await this.examAdminService.deleteExam(examId);
            res.status(200).json({ message: 'Exam deleted successfully' });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async getLatestExamVersion(req, res, next) {
        try {
            const { classId } = req.params;
            if (!classId) {
                return res.sendStatus(400);
            }
            const exam = await this.examAdminService.getLatestExamVersion(classId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async getAdminExam(req, res, next) {
        try {
            const { examId } = req.params;
            if (!examId) {
                return res.sendStatus(400);
            }
            const exam = await this.examAdminService.getAdminExam(examId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async getAllClassExams(req, res, next) {
        try {
            const { classId } = req.params;
            if (!classId) {
                return res.sendStatus(400);
            }
            const exams = await this.examAdminService.getAllClassExams(classId);
            res.status(200).json(exams);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async getAllClassExamsMetadataOnly(req, res, next) {
        try {
            const { classId } = req.params;
            if (!classId) {
                return res.sendStatus(400);
            }
            const exams = await this.examAdminService.getAllClassExamsMetadataOnly(classId);
            res.status(200).json(exams);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async getExamsDashboard(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.sendStatus(400);
            }
            const dashboard = await this.examAdminService.getExamsDashboard();
            res.status(200).json(dashboard);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async getUserExamAttempts(req, res, next) {
        try {
            const { examId, userId } = req.params;
            if (!userId || !examId) {
                return res.sendStatus(400);
            }
            const attempts = await this.examAdminService.getUserExamAttempts(userId, examId);
            res.status(200).json(attempts);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    // ─── Student ──────────────────────────────────────────────────────────────────
    async getUserExam(req, res, next) {
        try {
            const userId = req.user?.id;
            const { classId } = req.params;
            if (!userId || !classId) {
                return res.sendStatus(400);
            }
            const exam = await this.examStudentService.getUserExam(classId, userId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    // ─── Standalone ───────────────────────────────────────────────────────────────
    async createStandaloneExam(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.sendStatus(400);
            }
            const exam = await this.examStandaloneService.createStandaloneExam(userId);
            res.status(201).json(exam);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError)
                return res.status(400).json({ error });
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async getStandaloneExam(req, res, next) {
        try {
            const { standaloneExamId } = req.params;
            if (!standaloneExamId) {
                return res.sendStatus(400);
            }
            const exam = await this.examStandaloneService.getStandaloneExam(standaloneExamId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async getStandaloneExamMetadata(req, res, next) {
        try {
            const { standaloneExamId } = req.params;
            if (!standaloneExamId) {
                return res.sendStatus(400);
            }
            const exam = await this.examStandaloneService.getStandaloneExamMetadata(standaloneExamId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async updateStandaloneExamName(req, res, next) {
        try {
            const { standaloneExamId } = req.params;
            const { examTitle } = req.body;
            if (!standaloneExamId) {
                return res.sendStatus(400);
            }
            await this.examStandaloneService.updateStandaloneExamName(standaloneExamId, examTitle);
            res.status(200).json({ message: 'Exam name updated' });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async getStandaloneExamsWaitingForApproval(_req, res, next) {
        try {
            const exams = await this.examStandaloneService.getStandaloneExamsWaitingForApproval();
            res.status(200).json(exams);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async requestStandaloneExamApproval(req, res, next) {
        try {
            const { standaloneExamId } = req.params;
            if (!standaloneExamId) {
                return res.sendStatus(400);
            }
            const exam = await this.examStandaloneService.requestStandaloneExamApproval(standaloneExamId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async approveStandaloneExam(req, res, next) {
        try {
            const { standaloneExamId } = req.params;
            if (!standaloneExamId) {
                return res.sendStatus(400);
            }
            const exam = await this.examStandaloneService.approveStandaloneExam(standaloneExamId);
            res.status(200).json(exam);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
    async getMyStandaloneExams(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.sendStatus(400);
            }
            const exams = await this.examStandaloneService.getMyStandaloneExams(userId);
            res.status(200).json(exams);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                return res.status(400).json({ message: error.message });
            next(error);
        }
    }
};
exports.ExamController = ExamController;
exports.ExamController = ExamController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamAdminService)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamStudentService)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamStandaloneService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ExamController);
//# sourceMappingURL=exams.controller.js.map