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
exports.OptionRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const Option_entity_1 = require("../entities/Option.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let OptionRepository = class OptionRepository {
    async create(option) {
        return data_source_1.AppDataSource.manager.save(option);
    }
    async save(optionOrOptions) {
        return data_source_1.AppDataSource.manager.save(optionOrOptions);
    }
    async saveMultiple(optionOrOptions) {
        return data_source_1.AppDataSource.manager.save(optionOrOptions);
    }
    async delete(id) {
        await data_source_1.AppDataSource.manager.delete(Option_entity_1.Option, id);
    }
    async findAll() {
        return data_source_1.AppDataSource.manager.find(Option_entity_1.Option);
    }
    async findById(id, withQuestion, withExam) {
        if (withQuestion && !withExam) {
            return data_source_1.AppDataSource.manager.findOne(Option_entity_1.Option, {
                where: {
                    option_id: id,
                },
                relations: {
                    question: { question_type: true },
                },
            });
        }
        else if (withQuestion && withExam) {
            return data_source_1.AppDataSource.manager.findOne(Option_entity_1.Option, {
                where: {
                    option_id: id,
                },
                relations: {
                    question: { question_type: true, exam: true },
                },
            });
        }
        return data_source_1.AppDataSource.manager.findOne(Option_entity_1.Option, {
            where: {
                option_id: id,
            },
        });
    }
    async findAllByQuestionId(questionId, getOnlyActives) {
        const queryBuilder = data_source_1.AppDataSource.manager
            .createQueryBuilder(Option_entity_1.Option, 'option')
            .leftJoinAndSelect('option.question', 'question')
            .where('question.question_id = :questionId', { questionId });
        if (getOnlyActives) {
            queryBuilder.andWhere('option.status = :status', { status: ES_1.default.ACTIVE });
        }
        else {
            queryBuilder.andWhere('option.status = :status', { status: ES_1.default.INACTIVE });
        }
        return await queryBuilder.orderBy('option.created_at', 'ASC').getMany();
    }
    async deleteAllByQuestionId(questionId) {
        await data_source_1.AppDataSource.manager.delete(Option_entity_1.Option, {
            question_id: questionId,
            status: ES_1.default.ACTIVE,
        });
    }
};
exports.OptionRepository = OptionRepository;
exports.OptionRepository = OptionRepository = __decorate([
    (0, inversify_1.injectable)()
], OptionRepository);
//# sourceMappingURL=option.repository.js.map