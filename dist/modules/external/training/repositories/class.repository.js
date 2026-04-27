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
exports.ClassRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const Class_entity_1 = require("../entities/Class.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const typeorm_1 = require("typeorm");
let ClassRepository = class ClassRepository {
    async create(trainingClass) {
        return data_source_1.AppDataSource.manager.save(trainingClass);
    }
    async save(trainingClass) {
        return data_source_1.AppDataSource.manager.save(trainingClass);
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(Class_entity_1.Class);
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(Class_entity_1.Class, {
            where: {
                class_id: id,
            },
            relations: {
                user: true,
                comments: true,
                topic: true,
                exams: true,
            },
        });
    }
    async findByTopicId(topicId) {
        return await data_source_1.AppDataSource.manager.find(Class_entity_1.Class, {
            where: {
                topic_id: topicId,
            },
            relations: {
                user: true,
                comments: true,
            },
        });
    }
    async findClassesGroupedByTopic(topicIds) {
        const groupedClasses = new Map();
        if (!topicIds || topicIds.length === 0)
            return groupedClasses;
        const classes = await data_source_1.AppDataSource.manager.find(Class_entity_1.Class, {
            where: {
                topic_id: (0, typeorm_1.In)(topicIds),
            },
            order: {
                topic_id: 'ASC',
            },
        });
        for (const cls of classes) {
            if (!groupedClasses.has(cls.topic_id)) {
                groupedClasses.set(cls.topic_id, []);
            }
            groupedClasses.get(cls.topic_id).push(cls);
        }
        return groupedClasses;
    }
    async findByName(articleName) {
        return data_source_1.AppDataSource.manager.findOne(Class_entity_1.Class, {
            where: {
                class_name: articleName,
            },
        });
    }
    async findPublishedByTopic(topicId) {
        return await data_source_1.AppDataSource.manager.find(Class_entity_1.Class, {
            where: {
                topic_id: topicId,
                class_status: ES_1.default.PUBLISHED,
            },
            order: {
                class_name: 'DESC',
            },
        });
    }
};
exports.ClassRepository = ClassRepository;
exports.ClassRepository = ClassRepository = __decorate([
    (0, inversify_1.injectable)()
], ClassRepository);
//# sourceMappingURL=class.repository.js.map