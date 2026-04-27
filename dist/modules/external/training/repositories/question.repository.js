"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionRepository = void 0;
const inversify_1 = require("inversify");
const Question_entity_1 = require("../entities/Question.entity");
const data_source_1 = require("../../../../shared/database/data-source");
let QuestionRepository = class QuestionRepository {
    async create(question) {
        return data_source_1.AppDataSource.manager.save(question);
    }
    async save(question) {
        return data_source_1.AppDataSource.manager.save(question);
    }
    async findAll() {
        return data_source_1.AppDataSource.manager.find(Question_entity_1.Question);
    }
    async findById(id, withExam, withOptions = false) {
        if (withExam) {
            return data_source_1.AppDataSource.manager.findOne(Question_entity_1.Question, {
                where: {
                    question_id: id,
                },
                relations: {
                    question_type: true,
                    exam: true,
                },
            });
        }
        if (withOptions) {
            return data_source_1.AppDataSource.manager
                .createQueryBuilder(Question_entity_1.Question, 'question')
                .leftJoinAndSelect('question.options', 'options')
                .leftJoinAndSelect('question.question_type', 'question_type')
                .where('question.question_id = :id', { id })
                .addOrderBy('options.created_at', 'ASC')
                .getOne();
        }
        return data_source_1.AppDataSource.manager.findOne(Question_entity_1.Question, {
            where: {
                question_id: id,
            },
            relations: {
                question_type: true,
            },
        });
    }
    async findAllByExamId(examId, withOptions = false) {
        if (withOptions) {
            return data_source_1.AppDataSource.manager.find(Question_entity_1.Question, {
                where: {
                    exam_id: examId,
                },
                relations: {
                    question_type: true,
                    options: true,
                },
            });
        }
        return data_source_1.AppDataSource.manager.find(Question_entity_1.Question, {
            where: {
                exam_id: examId,
            },
            relations: {
                question_type: true,
            },
        });
    }
    async delete(id) {
        await data_source_1.AppDataSource.manager.delete(Question_entity_1.Question, id);
    }
    async deleteAllByExamId(examId) {
        await data_source_1.AppDataSource.manager.delete(Question_entity_1.Question, {
            exam_id: examId,
        });
    }
};
exports.QuestionRepository = QuestionRepository;
exports.QuestionRepository = QuestionRepository = __decorate([
    (0, inversify_1.injectable)()
], QuestionRepository);
//# sourceMappingURL=question.repository.js.map