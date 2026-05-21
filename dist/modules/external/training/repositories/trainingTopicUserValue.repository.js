"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingTopicUserValueRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const TrainingTopicUserValue_entity_1 = require("../entities/TrainingTopicUserValue.entity");
let TrainingTopicUserValueRepository = class TrainingTopicUserValueRepository {
    async save(value) {
        return await data_source_1.AppDataSource.manager.save(value);
    }
    async saveMany(values) {
        return await data_source_1.AppDataSource.manager.save(values);
    }
    // TODO: find user values but retrieving it for display with filter to only return ACTIVE values
    async findByTopicIdAndUserId(topicId, userId) {
        return await data_source_1.AppDataSource.manager.findOne(TrainingTopicUserValue_entity_1.TrainingTopicUserValue, {
            where: {
                topic_id: topicId,
                user_id: userId,
            },
        });
    }
    async findByCourseIdAndUserId(courseId, userId) {
        return await data_source_1.AppDataSource.manager.findOne(TrainingTopicUserValue_entity_1.TrainingTopicUserValue, {
            where: {
                topic: { course_id: courseId },
                user_id: userId,
            },
        });
    }
    async findByTopicId(topicId, users = false) {
        if (users) {
            return await data_source_1.AppDataSource.manager.find(TrainingTopicUserValue_entity_1.TrainingTopicUserValue, {
                where: {
                    topic_id: topicId,
                },
                relations: {
                    user: true,
                },
            });
        }
        else {
            return await data_source_1.AppDataSource.manager.find(TrainingTopicUserValue_entity_1.TrainingTopicUserValue, {
                where: {
                    topic_id: topicId,
                },
            });
        }
    }
    async findByUserIdAndCourseIdWithTopic(userId, courseId) {
        return await data_source_1.AppDataSource.manager.find(TrainingTopicUserValue_entity_1.TrainingTopicUserValue, {
            where: {
                topic: { course_id: courseId },
                user_id: userId,
            },
            relations: {
                topic: true,
                classValues: {
                    class: true,
                },
            },
        });
    }
    async findByUserIdAndCourseIds(userId, courseIds) {
        if (!courseIds || courseIds.length === 0)
            return [];
        // --- Manual Placeholder Strategy for IN Clause ---
        const parameters = { userId }; // Start parameters object with userId
        const placeholders = courseIds
            .map((id, index) => {
            const paramName = `courseId_${index}`; // Create unique names like :courseId_0, :courseId_1
            parameters[paramName] = id; // Add the actual courseId to the parameters object
            return `:${paramName}`; // Return the placeholder string e.g., ':courseId_0'
        })
            .join(', '); // Join them with commas: ':courseId_0, :courseId_1'
        // Resulting placeholders string: ':courseId_0, :courseId_1' (for 2 IDs)
        // Resulting parameters object: { userId: 'user-uuid', courseId_0: 'course-uuid-1', courseId_1: 'course-uuid-2' }
        // --- Query Builder using Manual Placeholders ---
        const queryBuilder = data_source_1.AppDataSource.manager
            .createQueryBuilder(TrainingTopicUserValue_entity_1.TrainingTopicUserValue, 'tuv')
            .innerJoin('tuv.topic', 'topic')
            // Use the constructed placeholders string and the full parameters object
            .where(`tuv.user_id = :userId AND topic.course_id IN (${placeholders})`, parameters)
            .select([
            // Select specific columns for efficiency
            'tuv.topic_value_id',
            'tuv.user_id',
            'tuv.topic_id',
            'tuv.completed_classes_count',
            'tuv.total_classes_count',
            // Add tuv.course_value_id if it exists and is needed
        ]);
        // Optionally add back if the service layer needs the full topic object:
        // .leftJoinAndSelect('tuv.topic', 'relatedTopic');
        return await queryBuilder.getMany();
    }
};
exports.TrainingTopicUserValueRepository = TrainingTopicUserValueRepository;
exports.TrainingTopicUserValueRepository = TrainingTopicUserValueRepository = __decorate([
    (0, inversify_1.injectable)()
], TrainingTopicUserValueRepository);
//# sourceMappingURL=trainingTopicUserValue.repository.js.map