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
exports.ExamAdminService = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const Exam_entity_1 = require("../entities/Exam.entity");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const CreateExamSchema_1 = require("../schema/exams/CreateExamSchema");
const UpdateExamSchema_1 = require("../schema/exams/UpdateExamSchema");
let ExamAdminService = class ExamAdminService {
    examRepository;
    userExamAttemptRepository;
    classRepository;
    questionService;
    constructor(examRepository, userExamAttemptRepository, classRepository, questionService) {
        this.examRepository = examRepository;
        this.userExamAttemptRepository = userExamAttemptRepository;
        this.classRepository = classRepository;
        this.questionService = questionService;
    }
    async createExam(input) {
        const validatedData = CreateExamSchema_1.CreateExamSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const examClass = await this.classRepository.findById(validatedData.classId);
            if (!examClass)
                throw new NotFoundError_1.NotFoundError('Class', validatedData.classId);
            const existingExams = await this.examRepository.findAllByClassId(examClass.class_id);
            let newExamVersion = 0;
            if (existingExams.length > 0) {
                const latestVersion = Math.max(...existingExams.map((exam) => exam.version));
                const latestExam = existingExams.find((exam) => exam.version === latestVersion);
                newExamVersion = latestVersion + 1;
                if (validatedData.referenceExamId) {
                    const referenceExam = existingExams.find((exam) => exam.exam_id === validatedData.referenceExamId);
                    if (!referenceExam)
                        throw new NotFoundError_1.NotFoundError('Reference Exam', validatedData.referenceExamId);
                    if (referenceExam.exam_status === ES_1.default.DRAFT)
                        throw new BusinessLogicError_1.BusinessLogicError('Reference Exam is not published');
                    if (!latestExam)
                        throw new Error('Latest Exam not found');
                    if (latestExam.exam_status !== ES_1.default.PUBLISHED)
                        throw new BusinessLogicError_1.BusinessLogicError('Latest Exam is not published');
                    const newExam = new Exam_entity_1.Exam();
                    newExam.class = examClass;
                    newExam.class_id = examClass.class_id;
                    newExam.exam_title = 'Exam for ' + examClass.class_name;
                    newExam.passing_score = referenceExam.passing_score;
                    newExam.version = newExamVersion;
                    newExam.exam_status = ES_1.default.DRAFT;
                    newExam.max_attempts = referenceExam.max_attempts;
                    const exam = await this.examRepository.create(newExam);
                    await this.questionService.replicateQuestionsFromExamIdToExamId(referenceExam.exam_id, exam.exam_id);
                    const returnExam = await this.getAdminExam(exam.exam_id);
                    return returnExam ?? exam;
                }
                else {
                    if (!latestExam)
                        throw new Error('Latest Exam not found');
                    if (latestExam.exam_status !== ES_1.default.PUBLISHED)
                        throw new BusinessLogicError_1.BusinessLogicError('Latest Exam is not published');
                    const newExam = new Exam_entity_1.Exam();
                    newExam.class = examClass;
                    newExam.class_id = examClass.class_id;
                    newExam.exam_title = 'Exam for ' + examClass.class_name;
                    newExam.passing_score = 75;
                    newExam.version = newExamVersion;
                    newExam.exam_status = ES_1.default.DRAFT;
                    newExam.max_attempts = 2;
                    const exam = await this.examRepository.create(newExam);
                    newExam.questions = [await this.questionService.createQuestion({ examId: exam.exam_id })];
                    return exam;
                }
            }
            else {
                newExamVersion = 1;
            }
            const newExam = new Exam_entity_1.Exam();
            newExam.class = examClass;
            newExam.class_id = examClass.class_id;
            newExam.exam_title = `Exam for ${examClass.class_name}`;
            newExam.passing_score = 75;
            newExam.version = newExamVersion;
            newExam.exam_status = ES_1.default.DRAFT;
            newExam.max_attempts = 2;
            const exam = await this.examRepository.create(newExam);
            newExam.questions = [await this.questionService.createQuestion({ examId: exam.exam_id })];
            return exam;
        });
    }
    async updateExam(examId, input) {
        const validatedData = UpdateExamSchema_1.UpdateExamSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const exam = await this.examRepository.findById(examId, false);
            if (!exam)
                throw new NotFoundError_1.NotFoundError('Exam', examId);
            if (exam.exam_status !== ES_1.default.DRAFT)
                throw new BusinessLogicError_1.BusinessLogicError('Exam is not in draft status');
            exam.passing_score = validatedData.passingScore;
            exam.max_attempts = validatedData.maxAttempts;
            const existingExams = await this.examRepository.findAllByClassId(exam.class_id);
            if (existingExams.length >= 2) {
                let prevExam = null;
                const latestVersion = Math.max(...existingExams.map((exam) => exam.version));
                for (const exam of existingExams) {
                    if (exam.version === latestVersion - 1) {
                        if (exam.exam_status !== ES_1.default.PUBLISHED) {
                            throw new BusinessLogicError_1.BusinessLogicError(`Prev exam version ${latestVersion - 1} is not published. Please publish it before publishing the new version.`);
                        }
                        prevExam = exam;
                    }
                }
                if (prevExam) {
                    prevExam.exam_status = ES_1.default.OUTDATED;
                    await this.examRepository.save(prevExam);
                }
            }
            if (validatedData.examStatus === ES_1.default.PUBLISHED && exam.exam_status === ES_1.default.DRAFT) {
                exam.exam_status = ES_1.default.PUBLISHED;
            }
            return await this.examRepository.save(exam);
        });
    }
    async deleteExam(examId) {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const exam = await this.examRepository.findById(examId, true);
            if (!exam)
                throw new NotFoundError_1.NotFoundError('Exam', examId);
            if (exam.exam_status !== ES_1.default.DRAFT)
                throw new BusinessLogicError_1.BusinessLogicError('Exam is not in draft status');
            await this.questionService.deleteAllQuestionsFromExam(examId);
            await this.examRepository.delete(examId);
        });
    }
    async getLatestExamVersion(classId) {
        const exams = await this.examRepository.findAllByClassId(classId);
        if (!exams || exams.length === 0)
            return null;
        const latestVersion = Math.max(...exams.map((exam) => exam.version));
        return exams.find((exam) => exam.version === latestVersion) ?? null;
    }
    async getAdminExam(examId) {
        return this.examRepository.findDetailedByExamId(examId);
    }
    async getAllClassExams(classId) {
        const classEntity = await this.classRepository.findById(classId);
        if (!classEntity)
            throw new NotFoundError_1.NotFoundError('Class', classId);
        const exams = await this.examRepository.findAllByClassId(classId);
        if (!exams)
            throw new NotFoundError_1.NotFoundError('Exams', classId);
        return exams;
    }
    async getAllClassExamsMetadataOnly(classId) {
        const classEntity = await this.classRepository.findById(classId);
        if (!classEntity)
            throw new NotFoundError_1.NotFoundError('Class', classId);
        const exams = await this.examRepository.findAllPlainByClassId(classId);
        if (!exams)
            throw new NotFoundError_1.NotFoundError('Exams', classId);
        return exams.map((exam) => ({
            exam_id: exam.exam_id,
            exam_title: exam.exam_title,
            version: exam.version,
            exam_status: exam.exam_status,
            created_at: exam.created_at,
        }));
    }
    async getExamsDashboard() {
        const userExamAttempts = await this.userExamAttemptRepository.findAllActive();
        const grouper = new Map();
        for (const attempt of userExamAttempts) {
            const key = `${attempt.user_id}-${attempt.exam_id}`;
            if (!grouper.has(key)) {
                grouper.set(key, [attempt]);
            }
            else {
                grouper.get(key).push(attempt);
            }
        }
        const result = [];
        for (const [_key, value] of grouper) {
            if (!value[0])
                continue;
            let finalAttempt = {
                user_id: value[0].user_id,
                first_name: value[0].first_name,
                last_name: value[0].last_name,
                course_name: value[0].course_name,
                topic_name: value[0].topic_name,
                class_id: value[0].class_id,
                class_name: value[0].class_name,
                status: value[0].status,
                score: value[0].score,
                exam_id: value[0].exam_id,
                user_valid_attempts_count: value.length,
                exam_max_attempts: value[0].exam_max_attempts,
                exam_version: value[0].exam_version,
                attempt_date: value[0].attempt_date,
            };
            for (const attempt of value) {
                if (finalAttempt.attempt_date < attempt.attempt_date) {
                    finalAttempt = {
                        user_id: attempt.user_id,
                        first_name: attempt.first_name,
                        last_name: attempt.last_name,
                        course_name: attempt.course_name,
                        topic_name: attempt.topic_name,
                        class_id: attempt.class_id,
                        class_name: attempt.class_name,
                        status: attempt.status,
                        score: attempt.score,
                        exam_id: attempt.exam_id,
                        user_valid_attempts_count: value.length,
                        exam_max_attempts: attempt.exam_max_attempts,
                        exam_version: attempt.exam_version,
                        attempt_date: attempt.attempt_date,
                    };
                }
            }
            result.push(finalAttempt);
        }
        return result;
    }
    async getUserExamAttempts(userId, examId) {
        return this.userExamAttemptRepository.findAllActiveByUserIdAndExamId(userId, examId);
    }
};
exports.ExamAdminService = ExamAdminService;
exports.ExamAdminService = ExamAdminService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserExamAttemptRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.IQuestionService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ExamAdminService);
//# sourceMappingURL=exam-admin.service.js.map