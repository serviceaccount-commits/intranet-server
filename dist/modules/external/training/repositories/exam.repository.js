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
exports.ExamRepository = void 0;
const inversify_1 = require("inversify");
const Exam_entity_1 = require("../entities/Exam.entity");
const data_source_1 = require("../../../../shared/database/data-source");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const StandaloneExam_entity_1 = require("../entities/StandaloneExam.entity");
let ExamRepository = class ExamRepository {
    async create(exam) {
        return await data_source_1.AppDataSource.manager.save(exam);
    }
    async createStandaloneExam(standaloneExam) {
        return await data_source_1.AppDataSource.manager.save(standaloneExam);
    }
    async findStandaloneExamById(standaloneExamId) {
        return await data_source_1.AppDataSource.manager.findOne(StandaloneExam_entity_1.StandaloneExam, {
            where: {
                standalone_exam_id: standaloneExamId,
            },
        });
    }
    async save(exam) {
        return await data_source_1.AppDataSource.manager.save(exam);
    }
    async saveStandaloneExam(standaloneExam) {
        return await data_source_1.AppDataSource.manager.save(standaloneExam);
    }
    async saveMany(exam) {
        return await data_source_1.AppDataSource.manager.save(exam);
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(Exam_entity_1.Exam);
    }
    async findById(id, withQuestions = false) {
        if (withQuestions) {
            return await data_source_1.AppDataSource.manager.findOne(Exam_entity_1.Exam, {
                where: {
                    exam_id: id,
                },
                relations: {
                    class: true,
                    questions: { options: true },
                },
            });
        }
        return await data_source_1.AppDataSource.manager.findOne(Exam_entity_1.Exam, {
            where: {
                exam_id: id,
            },
            relations: {
                class: true,
            },
        });
    }
    async findDetailedByExamId(examId) {
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(Exam_entity_1.Exam, 'exam')
            .leftJoinAndSelect('exam.standalone_exam', 'standalone_exam')
            .leftJoinAndSelect('exam.questions', 'questions')
            .leftJoinAndSelect('questions.question_type', 'question_type')
            .leftJoinAndSelect('questions.options', 'options', 'options.status = :status', { status: ES_1.default.ACTIVE })
            .where('exam.exam_id = :examId', { examId })
            .getOne();
    }
    async findDetailedByStandaloneExamId(standaloneExamId) {
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(Exam_entity_1.Exam, 'exam')
            .leftJoinAndSelect('exam.questions', 'questions')
            .leftJoinAndSelect('questions.question_type', 'question_type')
            .leftJoinAndSelect('questions.options', 'options', 'options.status = :status', { status: ES_1.default.ACTIVE })
            .where('exam.standalone_exam_id = :standaloneExamId', {
            standaloneExamId,
        })
            .getOne();
    }
    async findExamByStandaloneExamId(standaloneExamId) {
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(Exam_entity_1.Exam, 'exam')
            .leftJoinAndSelect('exam.class', 'class')
            .leftJoinAndSelect('exam.questions', 'questions')
            .leftJoinAndSelect('questions.question_type', 'question_type')
            .leftJoinAndSelect('questions.options', 'options', 'options.status = :status', { status: ES_1.default.ACTIVE })
            .where('exam.standalone_exam_id = :standaloneExamId', {
            standaloneExamId,
        })
            .getOne();
    }
    async findAllByClassId(classId) {
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(Exam_entity_1.Exam, 'exam')
            .leftJoinAndSelect('exam.class', 'class')
            .leftJoinAndSelect('exam.questions', 'questions')
            .leftJoinAndSelect('questions.question_type', 'question_type')
            .leftJoinAndSelect('questions.options', 'options', 'options.status = :status', { status: ES_1.default.ACTIVE })
            .where('class.class_id = :classId', { classId })
            .orderBy('exam.created_at', 'DESC')
            .orderBy('exam.version', 'DESC')
            .addOrderBy('questions.created_at', 'ASC')
            .addOrderBy('options.created_at', 'ASC')
            .getMany();
    }
    async findAllPlainByClassId(classId) {
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(Exam_entity_1.Exam, 'exam')
            .select([
            'exam.exam_id',
            'exam.exam_title',
            'exam.version',
            'exam.exam_status',
            'exam.created_at',
        ])
            .where('exam.class_id = :classId', { classId })
            .orderBy('exam.created_at', 'DESC')
            .getMany();
    }
    async delete(id) {
        await data_source_1.AppDataSource.manager.delete(Exam_entity_1.Exam, id);
    }
    async findAllStandaloneExamsWaitingForApproval() {
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(StandaloneExam_entity_1.StandaloneExam, 'standalone_exam')
            .leftJoinAndSelect('standalone_exam.user', 'user')
            .leftJoinAndSelect('standalone_exam.approved_by', 'approved_by')
            .leftJoinAndSelect('standalone_exam.exam', 'exam')
            .where('standalone_exam.standalone_exam_status = :status', {
            status: ES_1.default.AWAITING_APPROVAL,
        })
            .getMany();
    }
    async findAllStandaloneExamsByUserId(userId) {
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(StandaloneExam_entity_1.StandaloneExam, 'standalone_exam')
            .leftJoinAndSelect('standalone_exam.user', 'user')
            .leftJoinAndSelect('standalone_exam.approved_by', 'approved_by')
            .leftJoinAndSelect('standalone_exam.exam', 'exam')
            .where('standalone_exam.user_id = :userId', { userId })
            .getMany();
    }
};
exports.ExamRepository = ExamRepository;
exports.ExamRepository = ExamRepository = __decorate([
    (0, inversify_1.injectable)()
], ExamRepository);
//# sourceMappingURL=exam.repository.js.map