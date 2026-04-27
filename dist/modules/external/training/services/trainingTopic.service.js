"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingTopicService = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const TrainingTopic_entity_1 = require("../entities/TrainingTopic.entity");
const CreateTrainingTopicSchema_1 = require("../schema/trainingTopics/CreateTrainingTopicSchema");
const UpdateTraingTopicSchema_1 = require("../schema/trainingTopics/UpdateTraingTopicSchema");
const TrainingTopicUserValue_entity_1 = require("../entities/TrainingTopicUserValue.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let TrainingTopicService = class TrainingTopicService {
    courseRepository;
    trainingTopicRepository;
    courseValueRepository;
    trainingTopicUserValueRepository;
    classRepository;
    classUserValueRepository;
    constructor(courseRepository, trainingTopicRepository, courseValueRepository, trainingTopicUserValueRepository, classRepository, classUserValueRepository) {
        this.courseRepository = courseRepository;
        this.trainingTopicRepository = trainingTopicRepository;
        this.courseValueRepository = courseValueRepository;
        this.trainingTopicUserValueRepository = trainingTopicUserValueRepository;
        this.classRepository = classRepository;
        this.classUserValueRepository = classUserValueRepository;
    }
    async createTopic(input) {
        const validatedData = CreateTrainingTopicSchema_1.CreateTrainingTopicSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const existingCourse = await this.courseRepository.findById(validatedData.courseId);
            if (!existingCourse) {
                throw new NotFoundError_1.NotFoundError('Course', validatedData.courseId);
            }
            existingCourse.updated_at = new Date();
            await this.courseRepository.save(existingCourse);
            // const existingTopic = await this.trainingTopicRepository.findByName(
            //   validatedData.topicName,
            // );
            // if (existingTopic) {
            //   throw new ConflictError(
            //     `Training topic with name ${validatedData.topicName} already exists.`,
            //   );
            // }
            const newTrainingTopic = new TrainingTopic_entity_1.TrainingTopic();
            newTrainingTopic.topic_name = validatedData.topicName;
            newTrainingTopic.course = existingCourse;
            newTrainingTopic.course_id = validatedData.courseId;
            newTrainingTopic.topic_status = ES_1.default.ACTIVE;
            const trainingTopic = await this.trainingTopicRepository.create(newTrainingTopic);
            const courseUserValues = await this.courseValueRepository.findByCourseId(validatedData.courseId, false);
            const newTrainingTopicUserValues = [];
            for (const courseUserValue of courseUserValues) {
                const newTrainingTopicUserValue = new TrainingTopicUserValue_entity_1.TrainingTopicUserValue();
                newTrainingTopicUserValue.user = courseUserValue.user;
                newTrainingTopicUserValue.user_id = courseUserValue.user_id;
                newTrainingTopicUserValue.topic = trainingTopic;
                newTrainingTopicUserValue.topic_id = trainingTopic.topic_id;
                newTrainingTopicUserValue.courseValue = courseUserValue;
                newTrainingTopicUserValue.course_value_id =
                    courseUserValue.course_value_id;
                newTrainingTopicUserValue.completed_classes_count = 0;
                newTrainingTopicUserValue.total_classes_count = 0;
                newTrainingTopicUserValues.push(newTrainingTopicUserValue);
            }
            if (newTrainingTopicUserValues.length > 0) {
                await this.trainingTopicUserValueRepository.saveMany(newTrainingTopicUserValues);
            }
            return trainingTopic;
        });
    }
    async updateTopic(topicId, input) {
        const validatedData = UpdateTraingTopicSchema_1.UpdateTrainingTopicSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const trainingTopic = await this.trainingTopicRepository.findById(topicId);
            if (!trainingTopic) {
                throw new NotFoundError_1.NotFoundError('Training topic', topicId);
            }
            const course = await this.courseRepository.findById(trainingTopic.course_id);
            if (course) {
                course.updated_at = new Date();
                await this.courseRepository.save(course);
            }
            trainingTopic.topic_name = validatedData.topicName;
            if (validatedData.topicStatus) {
                trainingTopic.topic_status = validatedData.topicStatus;
            }
            return await this.trainingTopicRepository.save(trainingTopic);
        });
    }
    async getTopics(courseId) {
        return await this.trainingTopicRepository.findAll(courseId);
    }
    async getTopicById(topicId) {
        const topic = await this.trainingTopicRepository.findById(topicId);
        if (!topic) {
            throw new NotFoundError_1.NotFoundError('Training Topic', topicId);
        }
        return topic;
    }
    async getPublishedClassesWithUserCompletionStatus(topicId, userId) {
        const topic = await this.trainingTopicRepository.findById(topicId);
        if (!topic) {
            throw new NotFoundError_1.NotFoundError('Training topic', topicId);
        }
        // 2 get all PUBLISHED classes for this topic
        const publishedClasses = await this.classRepository.findPublishedByTopic(topicId);
        if (publishedClasses.length === 0)
            return [];
        const publishedClassIds = publishedClasses.map((c) => c.class_id);
        // 3 get the user's completion status for these specific published classes
        const classUserValues = await this.classUserValueRepository.findByUserIdAndClassIds(userId, publishedClassIds);
        console.log('class values: ', classUserValues);
        // 4 create a map for lookup completion status
        const completionStatusMap = new Map();
        classUserValues.forEach((clsUserValue) => {
            completionStatusMap.set(clsUserValue.class_id, clsUserValue.completion_status);
        });
        // combine class data with user's completion status
        const results = publishedClasses.map((cls) => {
            const userStatus = completionStatusMap.get(cls.class_id);
            return {
                class: cls,
                userCompletionStatus: userStatus,
            };
        });
        return results;
    }
};
exports.TrainingTopicService = TrainingTopicService;
exports.TrainingTopicService = TrainingTopicService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ICourseRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.ITrainingTopicRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.ICourseUserValueRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.ITrainingTopicUserValueRepository)),
    __param(4, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassRepository)),
    __param(5, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassUserValueRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], TrainingTopicService);
//# sourceMappingURL=trainingTopic.service.js.map