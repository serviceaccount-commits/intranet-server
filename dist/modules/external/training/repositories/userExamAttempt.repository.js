"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserExamAttemptRepository = void 0;
const inversify_1 = require("inversify");
const UserExamAttempts_entity_1 = require("../entities/UserExamAttempts.entity");
const data_source_1 = require("../../../../shared/database/data-source");
let UserExamAttemptRepository = class UserExamAttemptRepository {
    async create(userExamAttempt) {
        return await data_source_1.AppDataSource.manager.save(userExamAttempt);
    }
    async findByUserIdAndClassId(userId, classId) {
        return await UserExamAttempts_entity_1.UserExamAttempt.find({
            where: {
                user_id: userId,
                exam: { class_id: classId },
            },
            relations: {
                exam: true,
                user: true,
            },
            order: {
                attempt_date: 'DESC',
            },
        });
    }
    async findByUserIdAndExamId(userId, examId) {
        return await data_source_1.AppDataSource.manager.find(UserExamAttempts_entity_1.UserExamAttempt, {
            where: {
                user_id: userId,
                exam_id: examId,
            },
            relations: {
                exam: true,
                user: true,
            },
            order: {
                attempt_date: 'DESC',
            },
        });
    }
    async findAllActive() {
        const queryBuilder = await data_source_1.AppDataSource.manager
            .createQueryBuilder(UserExamAttempts_entity_1.UserExamAttempt, 'uExamAttempt')
            .select('uExamAttempt.attempt_id', 'attempt_id')
            .addSelect('uExamAttempt.status', 'status')
            .addSelect('uExamAttempt.score', 'score')
            .addSelect('uExamAttempt.attempt_date', 'attempt_date')
            .leftJoin('uExamAttempt.user', 'user')
            .addSelect('user.user_id', 'user_id')
            .addSelect('user.first_name', 'first_name')
            .addSelect('user.last_name', 'last_name')
            .leftJoin('uExamAttempt.exam', 'exam')
            .addSelect('exam.exam_id', 'exam_id')
            .addSelect('exam.version', 'exam_version')
            .addSelect('exam.max_attempts', 'exam_max_attempts')
            .leftJoin('exam.class', 'class')
            .addSelect('class.class_name', 'class_name')
            .addSelect('class.class_id', 'class_id')
            .leftJoin('class.topic', 'topic')
            .addSelect('topic.topic_name', 'topic_name')
            .leftJoin('topic.course', 'course')
            .addSelect('course.course_name', 'course_name')
            .where('uExamAttempt.isValid = :isValid', { isValid: true })
            .skip(0)
            .take(30);
        const attempts = await queryBuilder
            .orderBy('uExamAttempt.attempt_date', 'DESC')
            .getRawMany();
        return attempts;
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(UserExamAttempts_entity_1.UserExamAttempt, {
            where: {
                attempt_id: id,
            },
            relations: {
                exam: true,
                user: true,
            },
        });
    }
    async findAllActiveByUserIdAndExamId(userId, examId) {
        const queryBuilder = await data_source_1.AppDataSource.manager
            .createQueryBuilder(UserExamAttempts_entity_1.UserExamAttempt, 'uExamAttempt')
            .select('uExamAttempt.attempt_id', 'attempt_id')
            .addSelect('uExamAttempt.status', 'status')
            .addSelect('uExamAttempt.score', 'score')
            .addSelect('uExamAttempt.attempt_date', 'attempt_date')
            .leftJoin('uExamAttempt.user', 'user', 'user.user_id = :userId')
            .addSelect('user.user_id', 'user_id')
            .addSelect('user.first_name', 'first_name')
            .addSelect('user.last_name', 'last_name')
            .leftJoin('uExamAttempt.exam', 'exam', 'exam.exam_id = :examId')
            .addSelect('exam.exam_id', 'exam_id')
            .addSelect('exam.version', 'exam_version')
            .addSelect('exam.max_attempts', 'exam_max_attempts')
            .leftJoin('exam.class', 'class')
            .addSelect('class.class_name', 'class_name')
            .addSelect('class.class_id', 'class_id')
            .leftJoin('class.topic', 'topic')
            .addSelect('topic.topic_name', 'topic_name')
            .leftJoin('topic.course', 'course')
            .addSelect('course.course_name', 'course_name')
            // .where('uExamAttempt.isValid = :isValid', { isValid: true })
            .andWhere('uExamAttempt.user_id = :userId', { userId })
            .andWhere('uExamAttempt.exam_id = :examId', { examId });
        const attempts = await queryBuilder
            .orderBy('uExamAttempt.attempt_date', 'ASC')
            .getRawMany();
        return attempts;
    }
};
exports.UserExamAttemptRepository = UserExamAttemptRepository;
exports.UserExamAttemptRepository = UserExamAttemptRepository = __decorate([
    (0, inversify_1.injectable)()
], UserExamAttemptRepository);
//# sourceMappingURL=userExamAttempt.repository.js.map