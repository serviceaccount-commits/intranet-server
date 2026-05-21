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
exports.UserExamAttemptService = void 0;
const inversify_1 = require("inversify");
const CreateUserExamAttemptSchema_1 = require("../schema/userExamAttempts/CreateUserExamAttemptSchema");
const UserExamAttempts_entity_1 = require("../entities/UserExamAttempts.entity");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const data_source_1 = require("../../../../shared/database/data-source");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const UserAnswers_entity_1 = require("../entities/UserAnswers.entity");
let UserExamAttemptService = class UserExamAttemptService {
    userExamAttemptRepository;
    userAnswerRepository;
    examRepository;
    questionRepository;
    classUserValueRepository;
    classService;
    constructor(userExamAttemptRepository, userAnswerRepository, examRepository, questionRepository, classUserValueRepository, classService) {
        this.userExamAttemptRepository = userExamAttemptRepository;
        this.userAnswerRepository = userAnswerRepository;
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.classUserValueRepository = classUserValueRepository;
        this.classService = classService;
    }
    async submitExamAnswers(input, userId) {
        const validatedData = CreateUserExamAttemptSchema_1.CreateUserExamAttemptSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const exam = await this.examRepository.findById(validatedData.examId, true);
            if (!exam) {
                throw new NotFoundError_1.NotFoundError('Exam not found', validatedData.examId);
            }
            if (exam.exam_status !== ES_1.default.PUBLISHED) {
                throw new BusinessLogicError_1.BusinessLogicError('Exam is not published');
            }
            const classUserValue = await this.classUserValueRepository.findByClassIdAndUserId(exam.class_id, userId);
            const userExamAttempts = await this.userExamAttemptRepository.findByUserIdAndExamId(userId, validatedData.examId);
            if (!classUserValue) {
                throw new BusinessLogicError_1.BusinessLogicError('Class not assigned to user');
            }
            let validAttempts = [];
            if (userExamAttempts.length > 0) {
                validAttempts = userExamAttempts.filter((attempt) => attempt.isValid);
                if (validAttempts.length === exam.max_attempts) {
                    throw new BusinessLogicError_1.BusinessLogicError('Max attempts reached');
                }
                if (validAttempts.findIndex((attempt) => attempt.status === ES_1.default.PASSED) !==
                    -1) {
                    throw new BusinessLogicError_1.BusinessLogicError('Exam already passed');
                }
                if (classUserValue?.completion_status === ES_1.default.COMPLETED) {
                    throw new BusinessLogicError_1.BusinessLogicError('Class already completed');
                }
            }
            const examQuestions = await this.questionRepository.findAllByExamId(validatedData.examId, true);
            if (!examQuestions) {
                throw new NotFoundError_1.NotFoundError('Questions not found', validatedData.examId);
            }
            if (examQuestions.length !== validatedData.answers.length) {
                throw new BusinessLogicError_1.BusinessLogicError('Invalid number of answers');
            }
            // IS A VALID EXAM RETRY
            const answerMap = new Map(validatedData.answers.map((answer) => [
                answer.questionId,
                new Set(answer.optionId),
            ]));
            let userCorrectQuestionCount = 0;
            for (const question of examQuestions) {
                if (!question.options)
                    continue;
                const correctOptionIds = new Set(question.options
                    .filter((opt) => opt.is_correct)
                    .map((opt) => opt.option_id));
                // Instant lookup instead of .find()
                const userAnswerOptionIds = answerMap.get(question.question_id) || new Set();
                let isQuestionCorrect = true;
                // Check if user selected all correct options
                for (const correctId of correctOptionIds) {
                    if (!userAnswerOptionIds.has(correctId)) {
                        isQuestionCorrect = false;
                        break;
                    }
                }
                // Check if user selected any incorrect options
                if (isQuestionCorrect &&
                    userAnswerOptionIds.size > correctOptionIds.size) {
                    isQuestionCorrect = false;
                }
                if (isQuestionCorrect) {
                    userCorrectQuestionCount++;
                }
            }
            const score = (userCorrectQuestionCount / examQuestions.length) * 100;
            const userExamAttempt = new UserExamAttempts_entity_1.UserExamAttempt();
            userExamAttempt.exam = exam;
            userExamAttempt.exam_id = exam.exam_id;
            userExamAttempt.user = classUserValue.user;
            userExamAttempt.user_id = classUserValue.user_id;
            userExamAttempt.score = score;
            if (score >= exam.passing_score) {
                userExamAttempt.status = ES_1.default.PASSED;
                await this.classService.updateClassUserValue(exam.class_id, userId, ES_1.default.COMPLETED);
            }
            else {
                userExamAttempt.status = ES_1.default.FAILED;
            }
            const attempt = await this.userExamAttemptRepository.create(userExamAttempt);
            for (const answer of validatedData.answers) {
                for (const optionId of answer.optionId) {
                    const newUserAnswer = new UserAnswers_entity_1.UserAnswer();
                    newUserAnswer.attempt = attempt;
                    newUserAnswer.attempt_id = attempt.attempt_id;
                    newUserAnswer.question_id = answer.questionId;
                    newUserAnswer.option_id = optionId;
                    await this.userAnswerRepository.create(newUserAnswer);
                }
            }
            return attempt;
        });
    }
    async getUserExamAnswers(attemptId) {
        const userExamAttempt = await this.userExamAttemptRepository.findById(attemptId);
        const exam = userExamAttempt?.exam;
        if (!exam) {
            throw new NotFoundError_1.NotFoundError('Exam not found', attemptId);
        }
        const questions = await this.questionRepository.findAllByExamId(exam.exam_id, true);
        if (!questions) {
            throw new NotFoundError_1.NotFoundError('Questions not found', attemptId);
        }
        const answers = await this.userAnswerRepository.findByAttemptId(attemptId);
        if (!answers) {
            throw new NotFoundError_1.NotFoundError('Answers not found', attemptId);
        }
        const returnQuestions = [];
        for (const question of questions) {
            if (!question.options)
                continue;
            const resultQuestion = {
                question_id: question.question_id,
                question_text: question.question_text,
                options: [],
            };
            for (const option of question.options) {
                if (!question.options)
                    continue;
                resultQuestion.options.push({
                    option_id: option.option_id,
                    option_text: option.option_text,
                    is_correct: option.is_correct,
                    userSelected: answers.some((answer) => {
                        return (answer.question_id === question.question_id &&
                            answer.option_id === option.option_id);
                    }),
                });
            }
            returnQuestions.push(resultQuestion);
        }
        return {
            attempt_id: userExamAttempt.attempt_id,
            questions: returnQuestions,
        };
    }
};
exports.UserExamAttemptService = UserExamAttemptService;
exports.UserExamAttemptService = UserExamAttemptService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserExamAttemptRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserAnswerRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.IQuestionRepository)),
    __param(4, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassUserValueRepository)),
    __param(5, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], UserExamAttemptService);
//# sourceMappingURL=userExamAttempt.service.js.map