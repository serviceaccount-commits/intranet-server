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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamStudentService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let ExamStudentService = class ExamStudentService {
    examRepository;
    classRepository;
    classUserValueRepository;
    userExamAttemptRepository;
    constructor(examRepository, classRepository, classUserValueRepository, userExamAttemptRepository) {
        this.examRepository = examRepository;
        this.classRepository = classRepository;
        this.classUserValueRepository = classUserValueRepository;
        this.userExamAttemptRepository = userExamAttemptRepository;
    }
    async getLatestExamVersion(classId) {
        const exams = await this.examRepository.findAllByClassId(classId);
        if (!exams || exams.length === 0)
            return null;
        const latestVersion = Math.max(...exams.map((exam) => exam.version));
        return exams.find((exam) => exam.version === latestVersion) ?? null;
    }
    async getUserExam(classId, userId) {
        const examClass = await this.classRepository.findById(classId);
        if (!examClass)
            throw new NotFoundError_1.NotFoundError('Class', classId);
        if (examClass.exams.length === 0)
            return;
        const classUserValue = await this.classUserValueRepository.findByClassIdAndUserId(classId, userId);
        if (!classUserValue)
            throw new NotFoundError_1.NotFoundError('Class User Value', classId);
        const userExamAttempts = await this.userExamAttemptRepository.findByUserIdAndClassId(userId, examClass.class_id);
        let validAttemptsCount = 0;
        for (const attempt of userExamAttempts) {
            if (attempt.isValid)
                validAttemptsCount++;
        }
        if (classUserValue.completion_status === ES_1.default.COMPLETED && validAttemptsCount === 0) {
            return;
        }
        const exam = await this.getLatestExamVersion(classId);
        if (!exam)
            throw new NotFoundError_1.NotFoundError('Exam', classId);
        if (!exam.questions)
            throw new NotFoundError_1.NotFoundError('Questions', classId);
        if (validAttemptsCount >= exam.max_attempts && exam.max_attempts !== 0) {
            throw new BusinessLogicError_1.BusinessLogicError('You have reached the maximum attempts');
        }
        return {
            exam_id: exam.exam_id,
            exam_title: exam.exam_title,
            passing_score: exam.passing_score,
            max_attempts: exam.max_attempts,
            version: exam.version,
            questions: exam.questions.map((question) => {
                if (!question.options)
                    throw new NotFoundError_1.NotFoundError('Options', classId);
                return {
                    question_id: question.question_id,
                    question_text: question.question_text,
                    options: question.options.map((option) => ({
                        option_id: option.option_id,
                        option_text: option.option_text,
                    })),
                    question_type: question.question_type,
                };
            }),
            exam_status: exam.exam_status,
        };
    }
    async getUserExamNoAttemptLimit(classId, userId) {
        const examClass = await this.classRepository.findById(classId);
        if (!examClass)
            throw new NotFoundError_1.NotFoundError('Class', classId);
        if (examClass.exams.length === 0)
            return;
        const classUserValue = await this.classUserValueRepository.findByClassIdAndUserId(classId, userId);
        if (!classUserValue)
            throw new NotFoundError_1.NotFoundError('Class User Value', classId);
        const userExamAttempts = await this.userExamAttemptRepository.findByUserIdAndClassId(userId, examClass.class_id);
        if (classUserValue.completion_status === ES_1.default.COMPLETED && userExamAttempts.length === 0) {
            return;
        }
        const exam = await this.getLatestExamVersion(classId);
        if (!exam)
            throw new NotFoundError_1.NotFoundError('Exam', classId);
        if (!exam.questions)
            throw new NotFoundError_1.NotFoundError('Questions', classId);
        return {
            exam_id: exam.exam_id,
            exam_title: exam.exam_title,
            passing_score: exam.passing_score,
            max_attempts: exam.max_attempts,
            version: exam.version,
            questions: exam.questions.map((question) => {
                if (!question.options)
                    throw new NotFoundError_1.NotFoundError('Options', classId);
                return {
                    question_id: question.question_id,
                    question_text: question.question_text,
                    options: question.options.map((option) => ({
                        option_id: option.option_id,
                        option_text: option.option_text,
                    })),
                    question_type: question.question_type,
                };
            }),
            exam_status: exam.exam_status,
        };
    }
    async getUserExamStatus(classId, userId) {
        const examClass = await this.classRepository.findById(classId);
        if (!examClass)
            throw new NotFoundError_1.NotFoundError('Class', classId);
        if (examClass.exams.length === 0)
            return ES_1.default.NO_EXAM;
        const classUserValue = await this.classUserValueRepository.findByClassIdAndUserId(classId, userId);
        if (!classUserValue)
            throw new NotFoundError_1.NotFoundError('Class User Value', classId);
        const userExamAttempts = await this.userExamAttemptRepository.findByUserIdAndClassId(userId, examClass.class_id);
        const userExam = await this.getUserExamNoAttemptLimit(classId, userId);
        if (!userExam)
            return ES_1.default.NO_EXAM;
        const hasPassed = userExamAttempts.some((attempt) => attempt.score >= attempt.exam.passing_score);
        const validAttempts = userExamAttempts.filter((attempt) => attempt.isValid);
        const exam = userExamAttempts[0]?.exam;
        if (!exam)
            return ES_1.default.NOT_ATTEMPTED;
        if (userExamAttempts.length === 0)
            return ES_1.default.NOT_ATTEMPTED;
        if (userExamAttempts.length > 0 && hasPassed)
            return ES_1.default.PASSED;
        if (userExamAttempts.length > 0 && !hasPassed && validAttempts.length < exam.max_attempts)
            return ES_1.default.CAN_RETAKE;
        if (userExamAttempts.length > 0 && !hasPassed && validAttempts.length >= exam.max_attempts)
            return ES_1.default.FAILED;
        return ES_1.default.NO_EXAM;
    }
};
exports.ExamStudentService = ExamStudentService;
exports.ExamStudentService = ExamStudentService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassUserValueRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserExamAttemptRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ExamStudentService);
//# sourceMappingURL=exam-student.service.js.map