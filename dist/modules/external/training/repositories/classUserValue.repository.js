"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassUserValueRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const ClassUserValue_entity_1 = require("../entities/ClassUserValue.entity");
const typeorm_1 = require("typeorm");
let ClassUserValueRepository = class ClassUserValueRepository {
    async save(value) {
        return await data_source_1.AppDataSource.manager.save(value);
    }
    async saveMany(values) {
        return await data_source_1.AppDataSource.manager.save(values);
    }
    // TODO: find user values but retrieving it for display with filter to only return ACTIVE values
    async findByClassIdAndUserId(classId, userId) {
        return await data_source_1.AppDataSource.manager.findOne(ClassUserValue_entity_1.ClassUserValue, {
            where: {
                class_id: classId,
                user_id: userId,
            },
            relations: {
                topicValue: true,
            },
        });
    }
    async findByTopicIdAndUserId(topicId, userId) {
        return await data_source_1.AppDataSource.manager.findOne(ClassUserValue_entity_1.ClassUserValue, {
            where: {
                topic_value_id: topicId,
                user_id: userId,
            },
        });
    }
    async findByClassId(classId, users = false) {
        if (users) {
            return await data_source_1.AppDataSource.manager.find(ClassUserValue_entity_1.ClassUserValue, {
                where: {
                    class_id: classId,
                },
                relations: {
                    user: true,
                },
            });
        }
        else {
            return await data_source_1.AppDataSource.manager.find(ClassUserValue_entity_1.ClassUserValue, {
                where: {
                    class_id: classId,
                },
            });
        }
    }
    async findByUserIdAndClassIds(userId, classIds) {
        if (!classIds || classIds.length === 0)
            return [];
        return await data_source_1.AppDataSource.manager.find(ClassUserValue_entity_1.ClassUserValue, {
            where: {
                user_id: userId,
                class_id: (0, typeorm_1.In)(classIds),
            },
            select: ['class_id', 'user_id', 'completion_status', 'class_value_id'],
        });
    }
};
exports.ClassUserValueRepository = ClassUserValueRepository;
exports.ClassUserValueRepository = ClassUserValueRepository = __decorate([
    (0, inversify_1.injectable)()
], ClassUserValueRepository);
//# sourceMappingURL=classUserValue.repository.js.map