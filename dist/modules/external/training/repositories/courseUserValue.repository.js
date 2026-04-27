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
exports.CourseUserValueRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const CourseUserValue_entity_1 = require("../entities/CourseUserValue.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let CourseUserValueRepository = class CourseUserValueRepository {
    async save(courseUserValue) {
        return await data_source_1.AppDataSource.manager.save(courseUserValue);
    }
    async saveMany(values) {
        return await data_source_1.AppDataSource.manager.save(values);
    }
    // TODO: find user values but retrieving it for display with filter to only return ACTIVE values
    async findByCourseIdAndUserId(courseId, userId) {
        return await data_source_1.AppDataSource.manager.findOne(CourseUserValue_entity_1.CourseUserValue, {
            where: {
                course_id: courseId,
                user_id: userId,
            },
        });
    }
    async findByCourseId(courseId, users = false) {
        if (users) {
            return await data_source_1.AppDataSource.manager.find(CourseUserValue_entity_1.CourseUserValue, {
                where: {
                    course_id: courseId,
                },
                relations: {
                    user: true,
                },
            });
        }
        else {
            return await data_source_1.AppDataSource.manager.find(CourseUserValue_entity_1.CourseUserValue, {
                where: {
                    course_id: courseId,
                },
            });
        }
    }
    async findByUserId(userId) {
        return await data_source_1.AppDataSource.manager.find(CourseUserValue_entity_1.CourseUserValue, {
            where: {
                user_id: userId,
                user_availability_status: ES_1.default.ACTIVE,
            },
            relations: {
                course: true,
                topicValues: true,
            },
        });
    }
};
exports.CourseUserValueRepository = CourseUserValueRepository;
exports.CourseUserValueRepository = CourseUserValueRepository = __decorate([
    (0, inversify_1.injectable)()
], CourseUserValueRepository);
//# sourceMappingURL=courseUserValue.repository.js.map