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
exports.ExamStandaloneService = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const Exam_entity_1 = require("../entities/Exam.entity");
const StandaloneExam_entity_1 = require("../entities/StandaloneExam.entity");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let ExamStandaloneService = class ExamStandaloneService {
    examRepository;
    userRepository;
    questionService;
    constructor(examRepository, userRepository, questionService) {
        this.examRepository = examRepository;
        this.userRepository = userRepository;
        this.questionService = questionService;
    }
    async createStandaloneExam(userId) {
        const user = await this.userRepository.findUserById(userId);
        if (!user)
            throw new NotFoundError_1.NotFoundError('User', userId);
        const standaloneExam = new StandaloneExam_entity_1.StandaloneExam();
        standaloneExam.user = user;
        standaloneExam.user_id = user.user_id;
        standaloneExam.standalone_exam_name = '';
        standaloneExam.standalone_exam_status = ES_1.default.IN_PROGRESS;
        const exam = await this.examRepository.createStandaloneExam(standaloneExam);
        const examEntity = new Exam_entity_1.Exam();
        examEntity.exam_id = exam.standalone_exam_id;
        examEntity.exam_title = exam.standalone_exam_name;
        examEntity.exam_status = exam.standalone_exam_status;
        examEntity.version = 1;
        examEntity.max_attempts = 2;
        examEntity.passing_score = 75;
        examEntity.exam_status = ES_1.default.DRAFT;
        examEntity.exam_type = ES_1.default.STANDALONE_EXAM;
        examEntity.standalone_exam_id = exam.standalone_exam_id;
        const createdExam = await this.examRepository.create(examEntity);
        examEntity.questions = [await this.questionService.createQuestion({ examId: createdExam.exam_id })];
        return { exam: createdExam, standaloneExam: exam };
    }
    async getStandaloneExam(standaloneExamId) {
        return this.examRepository.findDetailedByStandaloneExamId(standaloneExamId);
    }
    async getStandaloneExamMetadata(standaloneExamId) {
        return this.examRepository.findStandaloneExamById(standaloneExamId);
    }
    async updateStandaloneExamName(standaloneExamId, examTitle) {
        const exam = await this.examRepository.findStandaloneExamById(standaloneExamId);
        if (!exam)
            throw new NotFoundError_1.NotFoundError('Exam', standaloneExamId);
        exam.standalone_exam_name = examTitle;
        await this.examRepository.saveStandaloneExam(exam);
    }
    async requestStandaloneExamApproval(standaloneExamId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const standaloneExam = await this.examRepository.findStandaloneExamById(standaloneExamId);
            if (!standaloneExam)
                throw new NotFoundError_1.NotFoundError('Standalone Exam', standaloneExamId);
            if (standaloneExam.standalone_exam_status !== ES_1.default.IN_PROGRESS) {
                throw new BusinessLogicError_1.BusinessLogicError('Standalone Exam is not in progress');
            }
            standaloneExam.standalone_exam_status = ES_1.default.AWAITING_APPROVAL;
            standaloneExam.awaiting_approval_at = new Date();
            return this.examRepository.saveStandaloneExam(standaloneExam);
        });
    }
    async approveStandaloneExam(standaloneExamId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const standaloneExam = await this.examRepository.findStandaloneExamById(standaloneExamId);
            if (!standaloneExam)
                throw new NotFoundError_1.NotFoundError('Standalone Exam', standaloneExamId);
            if (standaloneExam.standalone_exam_status !== ES_1.default.AWAITING_APPROVAL) {
                throw new BusinessLogicError_1.BusinessLogicError('Standalone Exam is not awaiting approval');
            }
            standaloneExam.standalone_exam_status = ES_1.default.APPROVED;
            standaloneExam.approved_at = new Date();
            return this.examRepository.saveStandaloneExam(standaloneExam);
        });
    }
    async getStandaloneExamsWaitingForApproval() {
        return this.examRepository.findAllStandaloneExamsWaitingForApproval();
    }
    async getMyStandaloneExams(userId) {
        return this.examRepository.findAllStandaloneExamsByUserId(userId);
    }
};
exports.ExamStandaloneService = ExamStandaloneService;
exports.ExamStandaloneService = ExamStandaloneService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IQuestionService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ExamStandaloneService);
//# sourceMappingURL=exam-standalone.service.js.map