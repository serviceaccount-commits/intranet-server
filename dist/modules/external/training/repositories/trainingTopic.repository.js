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
exports.TrainingTopicRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const TrainingTopic_entity_1 = require("../entities/TrainingTopic.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const typeorm_1 = require("typeorm");
let TrainingTopicRepository = class TrainingTopicRepository {
    async create(topic) {
        return await data_source_1.AppDataSource.manager.save(topic);
    }
    async findAll(courseId) {
        return await data_source_1.AppDataSource.manager.find(TrainingTopic_entity_1.TrainingTopic, {
            where: {
                course_id: courseId,
            },
        });
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(TrainingTopic_entity_1.TrainingTopic, {
            where: {
                topic_id: id,
            },
        });
    }
    async findByName(topicName) {
        return await data_source_1.AppDataSource.manager.findOne(TrainingTopic_entity_1.TrainingTopic, {
            where: {
                topic_name: topicName,
            },
        });
    }
    async findActiveTopicsGroupedByCourse(courseIds) {
        const groupedTopics = new Map();
        if (!courseIds || courseIds.length === 0)
            return groupedTopics;
        // fetch active topics for the specified courses
        const trainingTopics = await data_source_1.AppDataSource.manager.find(TrainingTopic_entity_1.TrainingTopic, {
            where: {
                course_id: (0, typeorm_1.In)(courseIds),
                topic_status: ES_1.default.ACTIVE,
            },
            order: {
                course_id: 'ASC',
            },
        });
        // group the results by course_id
        for (const topic of trainingTopics) {
            if (!groupedTopics.has(topic.course_id)) {
                groupedTopics.set(topic.course_id, []);
            }
            groupedTopics.get(topic.course_id).push(topic);
        }
        return groupedTopics;
    }
    async findByCourseId(courseId) {
        return await data_source_1.AppDataSource.manager.find(TrainingTopic_entity_1.TrainingTopic, {
            where: {
                course_id: courseId,
            },
        });
    }
    async save(topic) {
        return await data_source_1.AppDataSource.manager.save(topic);
    }
};
exports.TrainingTopicRepository = TrainingTopicRepository;
exports.TrainingTopicRepository = TrainingTopicRepository = __decorate([
    (0, inversify_1.injectable)()
], TrainingTopicRepository);
//# sourceMappingURL=trainingTopic.repository.js.map