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
exports.ExamService = void 0;
const inversify_1 = require("inversify");
const CreateExamSchema_1 = require("../schema/exams/CreateExamSchema");
const Exam_entity_1 = require("../entities/Exam.entity");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const data_source_1 = require("../../../../shared/database/data-source");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const UpdateExamSchema_1 = require("../schema/exams/UpdateExamSchema");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const StandaloneExam_entity_1 = require("../entities/StandaloneExam.entity");
let ExamService = class ExamService {
    examRepository;
    userExamAttemptRepository;
    classRepository;
    classUserValueRepository;
    questionService;
    userRepository;
    constructor(examRepository, userExamAttemptRepository, classRepository, classUserValueRepository, questionService, userRepository) {
        this.examRepository = examRepository;
        this.userExamAttemptRepository = userExamAttemptRepository;
        this.classRepository = classRepository;
        this.classUserValueRepository = classUserValueRepository;
        this.questionService = questionService;
        this.userRepository = userRepository;
    }
    async createExam(input) {
        const validatedData = CreateExamSchema_1.CreateExamSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const examClass = await this.classRepository.findById(validatedData.classId);
            if (!examClass) {
                throw new NotFoundError_1.NotFoundError('Class', validatedData.classId);
            }
            const existingExams = await this.examRepository.findAllByClassId(examClass.class_id);
            let newExamVersion = 0;
            if (existingExams.length > 0) {
                const latestVersion = Math.max(...existingExams.map((exam) => exam.version));
                const latestExam = existingExams.find((exam) => exam.version === latestVersion);
                newExamVersion = latestVersion + 1;
                if (validatedData.referenceExamId) {
                    const referenceExam = existingExams.find((exam) => exam.exam_id === validatedData.referenceExamId);
                    if (!referenceExam) {
                        throw new NotFoundError_1.NotFoundError('Reference Exam', validatedData.referenceExamId);
                    }
                    if (referenceExam.exam_status === ES_1.default.DRAFT) {
                        throw new BusinessLogicError_1.BusinessLogicError('Reference Exam is not published');
                    }
                    if (!latestExam) {
                        throw new Error('Latest Exam not found');
                    }
                    if (latestExam.exam_status !== ES_1.default.PUBLISHED) {
                        throw new BusinessLogicError_1.BusinessLogicError('Latest Exam is not published');
                    }
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
                    if (returnExam) {
                        return returnExam;
                    }
                    else {
                        return exam;
                    }
                }
                else {
                    if (!latestExam) {
                        throw new Error('Latest Exam not found');
                    }
                    if (latestExam.exam_status !== ES_1.default.PUBLISHED) {
                        throw new BusinessLogicError_1.BusinessLogicError('Latest Exam is not published');
                    }
                    const newExam = new Exam_entity_1.Exam();
                    newExam.class = examClass;
                    newExam.class_id = examClass.class_id;
                    newExam.exam_title = 'Exam for ' + examClass.class_name;
                    newExam.passing_score = 75;
                    newExam.version = newExamVersion;
                    newExam.exam_status = ES_1.default.DRAFT;
                    newExam.max_attempts = 2;
                    const exam = await this.examRepository.create(newExam);
                    newExam.questions = [
                        await this.questionService.createQuestion({
                            examId: exam.exam_id,
                        }),
                    ];
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
            newExam.questions = [
                await this.questionService.createQuestion({
                    examId: exam.exam_id,
                }),
            ];
            return exam;
        });
    }
    async updateExam(examId, input) {
        const validatedData = UpdateExamSchema_1.UpdateExamSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const exam = await this.examRepository.findById(examId, false);
            if (!exam) {
                throw new NotFoundError_1.NotFoundError('Exam', examId);
            }
            if (exam.exam_status !== ES_1.default.DRAFT) {
                throw new BusinessLogicError_1.BusinessLogicError('Exam is not in draft status');
            }
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
            if (validatedData.examStatus === ES_1.default.PUBLISHED &&
                exam.exam_status === ES_1.default.DRAFT) {
                exam.exam_status = ES_1.default.PUBLISHED;
            }
            return await this.examRepository.save(exam);
        });
    }
    async deleteExam(examId) {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const exam = await this.examRepository.findById(examId, true);
            if (!exam) {
                throw new NotFoundError_1.NotFoundError('Exam', examId);
            }
            if (exam.exam_status !== ES_1.default.DRAFT) {
                throw new BusinessLogicError_1.BusinessLogicError('Exam is not in draft status');
            }
            await this.questionService.deleteAllQuestionsFromExam(examId);
            await this.examRepository.delete(examId);
        });
    }
    async getLatestExamVersion(classId) {
        const exams = await this.examRepository.findAllByClassId(classId);
        if (!exams) {
            return null;
        }
        const latestVersion = Math.max(...exams.map((exam) => exam.version));
        const latestExam = exams.find((exam) => exam.version === latestVersion);
        if (!latestExam) {
            return null;
        }
        return latestExam;
    }
    async getStandaloneExam(standaloneExamId) {
        const exam = await this.examRepository.findDetailedByStandaloneExamId(standaloneExamId);
        if (!exam) {
            return null;
        }
        return exam;
    }
    async getStandaloneExamMetadata(standaloneExamId) {
        const exam = await this.examRepository.findStandaloneExamById(standaloneExamId);
        if (!exam) {
            return null;
        }
        return exam;
    }
    async updateStandaloneExamName(standaloneExamId, examTitle) {
        const exam = await this.examRepository.findStandaloneExamById(standaloneExamId);
        if (!exam) {
            throw new NotFoundError_1.NotFoundError('Exam', standaloneExamId);
        }
        exam.standalone_exam_name = examTitle;
        await this.examRepository.saveStandaloneExam(exam);
    }
    async createStandaloneExam(userId) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError_1.NotFoundError('User', userId);
        }
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
        examEntity.questions = [
            await this.questionService.createQuestion({
                examId: createdExam.exam_id,
            }),
        ];
        return {
            exam: createdExam,
            standaloneExam: exam,
        };
    }
    async getAdminExam(examId) {
        const exam = await this.examRepository.findDetailedByExamId(examId);
        if (!exam) {
            return null;
        }
        return exam;
    }
    async getAllClassExams(classId) {
        const classEntity = await this.classRepository.findById(classId);
        if (!classEntity) {
            throw new NotFoundError_1.NotFoundError('Class', classId);
        }
        const exams = await this.examRepository.findAllByClassId(classId);
        if (!exams) {
            throw new NotFoundError_1.NotFoundError('Exams', classId);
        }
        return exams;
    }
    async getAllClassExamsMetadataOnly(classId) {
        const classEntity = await this.classRepository.findById(classId);
        if (!classEntity) {
            throw new NotFoundError_1.NotFoundError('Class', classId);
        }
        const exams = await this.examRepository.findAllPlainByClassId(classId);
        if (!exams) {
            throw new NotFoundError_1.NotFoundError('Exams', classId);
        }
        const examsMetadata = exams.map((exam) => {
            return {
                exam_id: exam.exam_id,
                exam_title: exam.exam_title,
                version: exam.version,
                exam_status: exam.exam_status,
                created_at: exam.created_at,
            };
        });
        return examsMetadata;
    }
    async getUserExam(classId, userId) {
        const examClass = await this.classRepository.findById(classId);
        if (!examClass) {
            throw new NotFoundError_1.NotFoundError('Class', classId);
        }
        if (examClass.exams.length === 0) {
            return;
        }
        const classUserValue = await this.classUserValueRepository.findByClassIdAndUserId(classId, userId);
        if (!classUserValue) {
            throw new NotFoundError_1.NotFoundError('Class User Value', classId);
        }
        const userExamAttempts = await this.userExamAttemptRepository.findByUserIdAndClassId(userId, examClass.class_id);
        console.log('REAL USER EXAM ATTEMPTS');
        console.log(userExamAttempts);
        let validAttemptsCount = 0;
        for (const attempt of userExamAttempts) {
            if (attempt.isValid) {
                validAttemptsCount++;
            }
        }
        if (classUserValue.completion_status === ES_1.default.COMPLETED &&
            validAttemptsCount === 0) {
            // USER COMPLETED THIS CLASS WHEN IT DIDN'T HAVE A EXAM ASSIGNED
            return;
        }
        else {
            // THE USER HAS NOT COMPLETED THIS CLASS/EXAM BEFORE
            // GET THE LATEST PUBLISHED VERSION OF THE CURRENT CLASS EXAM
            const exam = await this.getLatestExamVersion(classId);
            if (!exam) {
                throw new NotFoundError_1.NotFoundError('Exam', classId);
            }
            if (!exam.questions) {
                throw new NotFoundError_1.NotFoundError('Questions', classId);
            }
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
                    if (!question.options) {
                        throw new NotFoundError_1.NotFoundError('Options', classId);
                    }
                    return {
                        question_id: question.question_id,
                        question_text: question.question_text,
                        options: question.options.map((option) => {
                            return {
                                option_id: option.option_id,
                                option_text: option.option_text,
                            };
                        }),
                        question_type: question.question_type,
                    };
                }),
                exam_status: exam.exam_status,
            };
        }
    }
    async getUserExamNoAttemptLimit(classId, userId) {
        const examClass = await this.classRepository.findById(classId);
        if (!examClass) {
            throw new NotFoundError_1.NotFoundError('Class', classId);
        }
        if (examClass.exams.length === 0) {
            return;
        }
        const classUserValue = await this.classUserValueRepository.findByClassIdAndUserId(classId, userId);
        if (!classUserValue) {
            throw new NotFoundError_1.NotFoundError('Class User Value', classId);
        }
        const userExamAttempts = await this.userExamAttemptRepository.findByUserIdAndClassId(userId, examClass.class_id);
        console.log('REAL USER EXAM ATTEMPTS');
        console.log(userExamAttempts);
        if (classUserValue.completion_status === ES_1.default.COMPLETED &&
            userExamAttempts.length === 0) {
            // USER COMPLETED THIS CLASS WHEN IT DIDN'T HAVE A EXAM ASSIGNED
            return;
        }
        else {
            // THE USER HAS NOT COMPLETED THIS CLASS/EXAM BEFORE
            // GET THE LATEST PUBLISHED VERSION OF THE CURRENT CLASS EXAM
            const exam = await this.getLatestExamVersion(classId);
            if (!exam) {
                throw new NotFoundError_1.NotFoundError('Exam', classId);
            }
            if (!exam.questions) {
                throw new NotFoundError_1.NotFoundError('Questions', classId);
            }
            return {
                exam_id: exam.exam_id,
                exam_title: exam.exam_title,
                passing_score: exam.passing_score,
                max_attempts: exam.max_attempts,
                version: exam.version,
                questions: exam.questions.map((question) => {
                    if (!question.options) {
                        throw new NotFoundError_1.NotFoundError('Options', classId);
                    }
                    return {
                        question_id: question.question_id,
                        question_text: question.question_text,
                        options: question.options.map((option) => {
                            return {
                                option_id: option.option_id,
                                option_text: option.option_text,
                            };
                        }),
                        question_type: question.question_type,
                    };
                }),
                exam_status: exam.exam_status,
            };
        }
    }
    async getUserExamStatus(classId, userId) {
        const examClass = await this.classRepository.findById(classId);
        if (!examClass) {
            throw new NotFoundError_1.NotFoundError('Class', classId);
        }
        if (examClass.exams.length === 0) {
            console.log('NO EXAM 1');
            return ES_1.default.NO_EXAM;
        }
        const classUserValue = await this.classUserValueRepository.findByClassIdAndUserId(classId, userId);
        if (!classUserValue) {
            throw new NotFoundError_1.NotFoundError('Class User Value', classId);
        }
        const userExamAttempts = await this.userExamAttemptRepository.findByUserIdAndClassId(userId, examClass.class_id);
        console.log('userExamAttempts');
        console.log(userExamAttempts.length);
        const userExam = await this.getUserExamNoAttemptLimit(classId, userId);
        if (!userExam) {
            console.log('NO EXAM 2');
            return ES_1.default.NO_EXAM;
        }
        const hasPassed = userExamAttempts.some((attempt) => {
            return attempt.score >= attempt.exam.passing_score;
        });
        const validAttempts = userExamAttempts.filter((attempt) => attempt.isValid);
        const exam = userExamAttempts[0]?.exam;
        if (!exam) {
            console.log('NO EXAM 2');
            return ES_1.default.NOT_ATTEMPTED;
        }
        if (userExamAttempts.length === 0) {
            return ES_1.default.NOT_ATTEMPTED;
        }
        else if (userExamAttempts.length > 0 && hasPassed) {
            return ES_1.default.PASSED;
        }
        else if (userExamAttempts.length > 0 &&
            !hasPassed &&
            validAttempts.length < exam.max_attempts) {
            return ES_1.default.CAN_RETAKE;
        }
        else if (userExamAttempts.length > 0 &&
            !hasPassed &&
            validAttempts.length >= exam.max_attempts) {
            return ES_1.default.FAILED;
        }
        else {
            console.log('NO EXAM 3');
            return ES_1.default.NO_EXAM;
        }
    }
    async getExamsDashboard() {
        const userExamAttempts = await this.userExamAttemptRepository.findAllActive();
        const userExamAttemptsGrouper = new Map();
        for (const attempt of userExamAttempts) {
            if (!userExamAttemptsGrouper.has(`${attempt.user_id}-${attempt.exam_id}`)) {
                userExamAttemptsGrouper.set(`${attempt.user_id}-${attempt.exam_id}`, [
                    attempt,
                ]);
            }
            else {
                const existingAttempts = userExamAttemptsGrouper.get(`${attempt.user_id}-${attempt.exam_id}`);
                if (existingAttempts) {
                    existingAttempts.push(attempt);
                    userExamAttemptsGrouper.set(`${attempt.user_id}-${attempt.exam_id}`, existingAttempts);
                }
            }
        }
        const finalUserExamAttempts = [];
        for (const [_key, value] of userExamAttemptsGrouper) {
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
                if (finalAttempt && finalAttempt.attempt_date < attempt.attempt_date) {
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
            finalUserExamAttempts.push(finalAttempt);
        }
        console.log(finalUserExamAttempts);
        return finalUserExamAttempts;
    }
    async getUserExamAttempts(userId, examId) {
        return await this.userExamAttemptRepository.findAllActiveByUserIdAndExamId(userId, examId);
    }
    async requestStandaloneExamApproval(standaloneExamId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const standaloneExam = await this.examRepository.findStandaloneExamById(standaloneExamId);
            if (!standaloneExam) {
                throw new NotFoundError_1.NotFoundError('Standalone Exam', standaloneExamId);
            }
            if (standaloneExam.standalone_exam_status !== ES_1.default.IN_PROGRESS) {
                throw new BusinessLogicError_1.BusinessLogicError('Standalone Exam is not in progress');
            }
            standaloneExam.standalone_exam_status = ES_1.default.AWAITING_APPROVAL;
            standaloneExam.awaiting_approval_at = new Date();
            return await this.examRepository.saveStandaloneExam(standaloneExam);
        });
    }
    async approveStandaloneExam(standaloneExamId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const standaloneExam = await this.examRepository.findStandaloneExamById(standaloneExamId);
            if (!standaloneExam) {
                throw new NotFoundError_1.NotFoundError('Standalone Exam', standaloneExamId);
            }
            if (standaloneExam.standalone_exam_status !== ES_1.default.AWAITING_APPROVAL) {
                throw new BusinessLogicError_1.BusinessLogicError('Standalone Exam is not awaiting approval');
            }
            standaloneExam.standalone_exam_status = ES_1.default.APPROVED;
            standaloneExam.approved_at = new Date();
            return await this.examRepository.saveStandaloneExam(standaloneExam);
        });
    }
    async getStandaloneExamsWaitingForApproval() {
        return await this.examRepository.findAllStandaloneExamsWaitingForApproval();
    }
    async getMyStandaloneExams(userId) {
        return await this.examRepository.findAllStandaloneExamsByUserId(userId);
    }
};
exports.ExamService = ExamService;
exports.ExamService = ExamService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserExamAttemptRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassUserValueRepository)),
    __param(4, (0, inversify_1.inject)(containerTypes_1.TYPES.IQuestionService)),
    __param(5, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ExamService);
//# sourceMappingURL=exam.service.js.map