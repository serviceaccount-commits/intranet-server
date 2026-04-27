"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionTypeRepository = void 0;
const inversify_1 = require("inversify");
const QuestionType_entity_1 = require("../entities/QuestionType.entity");
const data_source_1 = require("../../../../shared/database/data-source");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let QuestionTypeRepository = class QuestionTypeRepository {
    async create(questionType) {
        return await data_source_1.AppDataSource.manager.save(questionType);
    }
    async save(questionType) {
        return await data_source_1.AppDataSource.manager.save(questionType);
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(QuestionType_entity_1.QuestionType);
    }
    async findMultipleSelection() {
        return await data_source_1.AppDataSource.manager.findOne(QuestionType_entity_1.QuestionType, {
            where: {
                type_name: ES_1.default.MULTIPLE_SELECTION,
            },
        });
    }
    async findTrueFalse() {
        return await data_source_1.AppDataSource.manager.findOne(QuestionType_entity_1.QuestionType, {
            where: {
                type_name: ES_1.default.TRUE_FALSE,
            },
        });
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(QuestionType_entity_1.QuestionType, {
            where: {
                question_type_id: id,
            },
        });
    }
    async findByTypeName(typeName) {
        return await data_source_1.AppDataSource.manager.findOne(QuestionType_entity_1.QuestionType, {
            where: {
                type_name: typeName,
            },
        });
    }
};
exports.QuestionTypeRepository = QuestionTypeRepository;
exports.QuestionTypeRepository = QuestionTypeRepository = __decorate([
    (0, inversify_1.injectable)()
], QuestionTypeRepository);
//# sourceMappingURL=questionType.repository.js.map