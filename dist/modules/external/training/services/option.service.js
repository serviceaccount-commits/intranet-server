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
exports.OptionService = void 0;
const inversify_1 = require("inversify");
const Option_entity_1 = require("../entities/Option.entity");
const CreateOptionSchema_1 = require("../schema/options/CreateOptionSchema");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const UpdateOptionSchema_1 = require("../schema/options/UpdateOptionSchema");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
let OptionService = class OptionService {
    optionRepository;
    questionRepository;
    examRepository;
    constructor(optionRepository, questionRepository, examRepository) {
        this.optionRepository = optionRepository;
        this.questionRepository = questionRepository;
        this.examRepository = examRepository;
    }
    async createOption(input) {
        const validatedData = CreateOptionSchema_1.CreateOptionSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const question = await this.questionRepository.findById(validatedData.questionId, false, false);
            if (!question) {
                throw new NotFoundError_1.NotFoundError('Question not found');
            }
            if (question.question_type.type_name === ES_1.default.TRUE_FALSE) {
                throw new BusinessLogicError_1.BusinessLogicError('Cannot create options for True/False questions');
            }
            const newOption = new Option_entity_1.Option();
            newOption.option_text = '';
            newOption.is_correct = false;
            newOption.question_id = validatedData.questionId;
            return await this.optionRepository.create(newOption);
        });
    }
    async updateOption(optionId, input) {
        const validatedData = UpdateOptionSchema_1.UpdateOptionSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const exam = await this.examRepository.findById(validatedData.examId, false);
            if (!exam) {
                throw new NotFoundError_1.NotFoundError('Exam not found');
            }
            if (exam.exam_status !== ES_1.default.DRAFT) {
                throw new BusinessLogicError_1.BusinessLogicError('Exam is not in draft status');
            }
            const option = await this.optionRepository.findById(optionId, false, false);
            if (!option) {
                throw new NotFoundError_1.NotFoundError('Option not found');
            }
            const question = await this.questionRepository.findById(validatedData.questionId, false, false);
            if (!question) {
                throw new NotFoundError_1.NotFoundError('Question not found');
            }
            if (question.question_type.type_name === ES_1.default.MULTIPLE_SELECTION) {
                option.option_text = validatedData.optionText;
                option.is_correct = validatedData.isCorrect;
                return await this.optionRepository.save(option);
            }
            else if (question.question_type.type_name === ES_1.default.TRUE_FALSE) {
                const allOptions = await this.optionRepository.findAllByQuestionId(validatedData.questionId, true);
                // For True/False, selecting one option deselects the other.
                // This logic ensures only one option is marked as correct.
                for (const opt of allOptions) {
                    // Set the clicked option to true, all others to false.
                    console.log(opt.option_id);
                    opt.is_correct = opt.option_id === optionId;
                }
                // Save all changes in one go. This is more efficient.
                await this.optionRepository.save(allOptions);
                const updatedOption = allOptions.find((opt) => opt.option_id === optionId);
                if (!updatedOption) {
                    throw new BusinessLogicError_1.BusinessLogicError('Failed to find the updated option after saving.');
                }
                return updatedOption;
                // Return the specific option that was updated.
            }
            else {
                throw new BusinessLogicError_1.BusinessLogicError('Invalid question type');
            }
        });
    }
    async deleteOption(optionId) {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const option = await this.optionRepository.findById(optionId, true, true);
            if (!option) {
                throw new NotFoundError_1.NotFoundError('Option not found');
            }
            if (option.question.exam.exam_status !== ES_1.default.DRAFT) {
                throw new BusinessLogicError_1.BusinessLogicError('Exam is not in draft status');
            }
            if (option.question.question_type.type_name === ES_1.default.TRUE_FALSE) {
                throw new BusinessLogicError_1.BusinessLogicError('Cannot delete options for True/False questions');
            }
            await this.optionRepository.delete(optionId);
        });
    }
    async replicateOptionsFromQuestionIdToQuestionId(sourceQuestionId, targetQuestionId) {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const sourceQuestion = await this.questionRepository.findById(sourceQuestionId, false, false);
            const targetQuestion = await this.questionRepository.findById(targetQuestionId, false, false);
            if (!sourceQuestion || !targetQuestion) {
                throw new Error('Source or target question not found');
            }
            const sourceOptions = await this.optionRepository.findAllByQuestionId(sourceQuestionId, true);
            for (const sourceOption of sourceOptions) {
                const newOption = new Option_entity_1.Option();
                newOption.option_text = sourceOption.option_text;
                newOption.is_correct = sourceOption.is_correct;
                newOption.question_id = targetQuestionId;
                await this.optionRepository.create(newOption);
            }
        });
    }
    async deactivateMultipleSelectionOptions(questionId) {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const options = await this.optionRepository.findAllByQuestionId(questionId, true);
            let optionsToSave = [];
            for (const option of options) {
                if (option.question_id === questionId) {
                    option.status = ES_1.default.INACTIVE;
                    optionsToSave.push(option);
                }
            }
            await this.optionRepository.save(optionsToSave);
        });
    }
    async activateMultipleSelectionOptions(questionId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const options = await this.optionRepository.findAllByQuestionId(questionId, false);
            let optionsToSave = [];
            console.log('OPTIONSSS: ', options);
            for (const option of options) {
                if (option.question_id === questionId) {
                    option.status = ES_1.default.ACTIVE;
                    optionsToSave.push(option);
                }
            }
            return await this.optionRepository.saveMultiple(optionsToSave);
        });
    }
    async deleteAllOptionsFromQuestion(questionId) {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            await this.optionRepository.deleteAllByQuestionId(questionId);
        });
    }
    async createTrueFalseOptions(questionId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const question = await this.questionRepository.findById(questionId, false, false);
            if (!question) {
                throw new Error('Question not found');
            }
            const trueOption = new Option_entity_1.Option();
            trueOption.option_text = 'True';
            trueOption.is_correct = true;
            trueOption.question_id = questionId;
            trueOption.question = question;
            const falseOption = new Option_entity_1.Option();
            falseOption.option_text = 'False';
            falseOption.is_correct = false;
            falseOption.question_id = questionId;
            falseOption.question = question;
            let ret = [];
            const trueOptionCreated = await this.optionRepository.create(trueOption);
            const falseOptionCreated = await this.optionRepository.create(falseOption);
            ret.push(trueOptionCreated);
            ret.push(falseOptionCreated);
            return ret;
        });
    }
};
exports.OptionService = OptionService;
exports.OptionService = OptionService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IOptionRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IQuestionRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], OptionService);
//# sourceMappingURL=option.service.js.map