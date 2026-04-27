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
exports.QuestionTypeService = void 0;
const inversify_1 = require("inversify");
const QuestionType_entity_1 = require("../entities/QuestionType.entity");
const CreateQuestionTypeSchema_1 = require("../schema/questionTypes/CreateQuestionTypeSchema");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const data_source_1 = require("../../../../shared/database/data-source");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
let QuestionTypeService = class QuestionTypeService {
    questionTypeRepository;
    constructor(questionTypeRepository) {
        this.questionTypeRepository = questionTypeRepository;
    }
    async createQuestionType(input) {
        const validatedDate = CreateQuestionTypeSchema_1.CreateQuestionTypeSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            if (validatedDate.typeName === ES_1.default.MULTIPLE_SELECTION) {
                const existingMultipleSelection = await this.questionTypeRepository.findMultipleSelection();
                if (existingMultipleSelection) {
                    throw new BusinessLogicError_1.BusinessLogicError('Multiple Selection Question Type already exists');
                }
                const newQuestionType = new QuestionType_entity_1.QuestionType();
                newQuestionType.type_name = ES_1.default.MULTIPLE_SELECTION;
                return await this.questionTypeRepository.create(newQuestionType);
            }
            else if (validatedDate.typeName === ES_1.default.TRUE_FALSE) {
                const existingTrueFalse = await this.questionTypeRepository.findTrueFalse();
                if (existingTrueFalse) {
                    throw new BusinessLogicError_1.BusinessLogicError('True/False Question Type already exists');
                }
                const newQuestionType = new QuestionType_entity_1.QuestionType();
                newQuestionType.type_name = ES_1.default.TRUE_FALSE;
                return await this.questionTypeRepository.create(newQuestionType);
            }
        });
    }
};
exports.QuestionTypeService = QuestionTypeService;
exports.QuestionTypeService = QuestionTypeService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IQuestionTypeRepository)),
    __metadata("design:paramtypes", [Object])
], QuestionTypeService);
//# sourceMappingURL=questionType.service.js.map