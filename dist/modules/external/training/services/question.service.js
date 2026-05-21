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
exports.QuestionService = void 0;
const inversify_1 = require("inversify");
const Question_entity_1 = require("../entities/Question.entity");
const CreateQuestionSchema_1 = require("../schema/questions/CreateQuestionSchema");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const UpdateQuestionSchema_1 = require("../schema/questions/UpdateQuestionSchema");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
let QuestionService = class QuestionService {
    examRepository;
    questionTypeRepository;
    questionRepository;
    optionService;
    constructor(examRepository, questionTypeRepository, questionRepository, optionService) {
        this.examRepository = examRepository;
        this.questionTypeRepository = questionTypeRepository;
        this.questionRepository = questionRepository;
        this.optionService = optionService;
    }
    async createQuestion(input) {
        const validatedDate = CreateQuestionSchema_1.CreateQuestionSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const existingExam = await this.examRepository.findById(validatedDate.examId, false);
            const multipleSelectionQType = await this.questionTypeRepository.findMultipleSelection();
            if (!multipleSelectionQType) {
                throw new NotFoundError_1.NotFoundError('Question type', ES_1.default.MULTIPLE_SELECTION);
            }
            if (!existingExam) {
                throw new Error('Exam not found');
            }
            const newQuestion = new Question_entity_1.Question();
            newQuestion.exam = existingExam;
            newQuestion.exam_id = existingExam.exam_id;
            newQuestion.question_text = '';
            newQuestion.question_type_id = multipleSelectionQType.question_type_id;
            newQuestion.question_type = multipleSelectionQType;
            const question = await this.questionRepository.create(newQuestion);
            question.options = [
                await this.optionService.createOption({
                    questionId: question.question_id,
                }),
            ];
            return question;
        });
    }
    async updateQuestion(questionId, input) {
        const validatedData = UpdateQuestionSchema_1.UpdateQuestionSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const exam = await this.examRepository.findById(validatedData.examId, false);
            if (!exam) {
                throw new NotFoundError_1.NotFoundError('Exam', validatedData.examId);
            }
            if (exam.exam_status !== ES_1.default.DRAFT) {
                throw new BusinessLogicError_1.BusinessLogicError('Exam is not in draft status');
            }
            const question = await this.questionRepository.findById(questionId, false, true);
            if (!question) {
                throw new NotFoundError_1.NotFoundError('Question', questionId);
            }
            if (question.question_text !== validatedData.questionText) {
                question.question_text = validatedData.questionText;
            }
            const questionType = await this.questionTypeRepository.findByTypeName(validatedData.questionType);
            if (!questionType) {
                throw new NotFoundError_1.NotFoundError('Question Type', validatedData.questionType);
            }
            let optionsResponse = [];
            if (question.question_type.type_name !== questionType.type_name) {
                question.question_type = questionType;
                question.question_type_id = questionType.question_type_id;
                if (questionType.type_name === ES_1.default.MULTIPLE_SELECTION) {
                    await this.optionService.deleteAllOptionsFromQuestion(questionId);
                }
                else if (questionType.type_name === ES_1.default.TRUE_FALSE) {
                    await this.optionService.deactivateMultipleSelectionOptions(questionId);
                }
                if (questionType.type_name === ES_1.default.TRUE_FALSE && question.options) {
                    optionsResponse =
                        await this.optionService.createTrueFalseOptions(questionId);
                    question.options = [...question.options, ...optionsResponse];
                }
                else if (questionType.type_name === ES_1.default.MULTIPLE_SELECTION) {
                    const tempOptionsResponse = await this.optionService.activateMultipleSelectionOptions(questionId);
                    question.options = tempOptionsResponse;
                    optionsResponse = tempOptionsResponse;
                }
            }
            const responseQuestion = await this.questionRepository.save(question);
            if (optionsResponse.length === 0 && question.options) {
                optionsResponse = question.options;
            }
            return {
                question: responseQuestion,
                options: optionsResponse,
            };
        });
    }
    async deleteQuestion(questionId) {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const question = await this.questionRepository.findById(questionId, true, false);
            if (!question) {
                throw new NotFoundError_1.NotFoundError('Question not found');
            }
            if (question.exam.exam_status !== ES_1.default.DRAFT) {
                throw new BusinessLogicError_1.BusinessLogicError('Exam is not in draft status');
            }
            await this.optionService.deleteAllOptionsFromQuestion(questionId);
            await this.questionRepository.delete(questionId);
        });
    }
    async deleteAllQuestionsFromExam(examId) {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const exam = await this.examRepository.findById(examId, true);
            if (!exam) {
                throw new NotFoundError_1.NotFoundError('Exam not found');
            }
            if (exam.exam_status !== ES_1.default.DRAFT) {
                throw new BusinessLogicError_1.BusinessLogicError('Exam is not in draft status');
            }
            const questions = await this.questionRepository.findAllByExamId(examId, false);
            if (!questions) {
                return;
            }
            for (const question of questions) {
                await this.optionService.deleteAllOptionsFromQuestion(question.question_id);
            }
            await this.questionRepository.deleteAllByExamId(examId);
        });
    }
    async replicateQuestionsFromExamIdToExamId(sourceExamId, targetExamId) {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const sourceExam = await this.examRepository.findById(sourceExamId, true);
            const targetExam = await this.examRepository.findById(targetExamId, true);
            if (!sourceExam || !sourceExam.questions) {
                throw new NotFoundError_1.NotFoundError('Source Exam or its questions not found');
            }
            if (!targetExam) {
                throw new NotFoundError_1.NotFoundError('Target Exam not found');
            }
            for (const sourceQuestion of sourceExam.questions) {
                const newQuestion = new Question_entity_1.Question();
                newQuestion.exam_id = targetExam.exam_id;
                newQuestion.question_text = sourceQuestion.question_text;
                newQuestion.question_type_id = sourceQuestion.question_type_id;
                const createdQuestion = await this.questionRepository.create(newQuestion);
                if (sourceQuestion.options) {
                    await this.optionService.replicateOptionsFromQuestionIdToQuestionId(sourceQuestion.question_id, createdQuestion.question_id);
                }
            }
        });
    }
};
exports.QuestionService = QuestionService;
exports.QuestionService = QuestionService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IQuestionTypeRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IQuestionRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.IOptionService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], QuestionService);
//# sourceMappingURL=question.service.js.map