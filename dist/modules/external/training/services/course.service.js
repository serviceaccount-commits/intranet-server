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
exports.CourseService = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const Course_entity_1 = require("../entities/Course.entity");
const CreateCourseSchema_1 = require("../schema/courses/CreateCourseSchema");
const UpdateCourseSchema_1 = require("../schema/courses/UpdateCourseSchema");
const CourseUserValue_entity_1 = require("../entities/CourseUserValue.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const TrainingTopicUserValue_entity_1 = require("../entities/TrainingTopicUserValue.entity");
const ClassUserValue_entity_1 = require("../entities/ClassUserValue.entity");
let CourseService = class CourseService {
    courseRepository;
    userRepository;
    courseValueRepository;
    trainingTopicValueRepository;
    trainingTopicRepository;
    classRepository;
    classValueRepository;
    examStudentService;
    constructor(courseRepository, userRepository, courseValueRepository, trainingTopicValueRepository, trainingTopicRepository, classRepository, classValueRepository, examStudentService) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.courseValueRepository = courseValueRepository;
        this.trainingTopicValueRepository = trainingTopicValueRepository;
        this.trainingTopicRepository = trainingTopicRepository;
        this.classRepository = classRepository;
        this.classValueRepository = classValueRepository;
        this.examStudentService = examStudentService;
    }
    async createCourse(input) {
        const validatedData = CreateCourseSchema_1.CreateCourseSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            // const existingCourse = await this.courseRepository.findByName(
            //   validatedData.courseName,
            // );
            // if (existingCourse) {
            //   throw new ConflictError(
            //     `Course with name ${validatedData.courseName} already exists.`,
            //   );
            // }
            const user = await this.userRepository.findUserById(validatedData.userId);
            if (!user) {
                throw new NotFoundError_1.NotFoundError('User', validatedData.userId);
            }
            const newCourse = new Course_entity_1.Course();
            newCourse.course_name = validatedData.courseName;
            newCourse.course_description = validatedData.courseDescription;
            newCourse.course_status = validatedData.status;
            newCourse.user = user;
            newCourse.user_id = user.user_id;
            const course = await this.courseRepository.create(newCourse);
            if (validatedData.userIds) {
                const users = await this.userRepository.findUserByIds(validatedData.userIds);
                for (const user of users) {
                    const newCourseUserValue = new CourseUserValue_entity_1.CourseUserValue();
                    newCourseUserValue.user = user;
                    newCourseUserValue.user_id = user.user_id;
                    newCourseUserValue.course = course;
                    newCourseUserValue.course_id = course.course_id;
                    newCourseUserValue.user_availability_status = ES_1.default.ACTIVE;
                    await this.courseValueRepository.save(newCourseUserValue);
                }
            }
            return course;
        });
    }
    async updateCourse(courseId, input) {
        const validatedData = UpdateCourseSchema_1.UpdateCourseSchema.parse(input);
        const newUserIds = validatedData.userIds;
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                throw new NotFoundError_1.NotFoundError('Course', courseId);
            }
            course.course_name = validatedData.courseName;
            course.course_description = validatedData.courseDescription;
            course.course_status = validatedData.status;
            course.updated_at = new Date();
            let usersToGrantAccess = [];
            if (newUserIds.length > 0) {
                usersToGrantAccess =
                    await this.userRepository.findUserByIds(newUserIds);
                if (usersToGrantAccess.length !== newUserIds.length) {
                    throw new NotFoundError_1.NotFoundError('User(s)');
                }
            }
            // 2 USERS TO GRANT ACCESS
            // fetch all existing CourseUserValue records for this course
            const currentCourseValues = await this.courseValueRepository.findByCourseId(course.course_id, false);
            // 3 COURSE_USER_VALUE
            // map currnt records for lookup
            const currentCourseValuesMap = new Map();
            currentCourseValues.forEach((value) => currentCourseValuesMap.set(value.user_id, value));
            // USER ID -> HIS COURSE_USER_VALUE
            const courseValuesToSave = [];
            const trainingTopicValuesToSave = [];
            const classUserValuesToSave = [];
            const newUserIdSet = new Set(newUserIds);
            // process exisiting records: Deactivate those no longer in the new list
            for (const currentValue of currentCourseValues) {
                if (currentValue.user_availability_status === ES_1.default.ACTIVE &&
                    !newUserIdSet.has(currentValue.user_id)) {
                    currentValue.user_availability_status = ES_1.default.INACTIVE;
                    courseValuesToSave.push(currentValue);
                }
                else if (currentValue.user_availability_status === ES_1.default.INACTIVE &&
                    newUserIdSet.has(currentValue.user_id)) {
                    currentValue.user_availability_status = ES_1.default.ACTIVE;
                    courseValuesToSave.push(currentValue);
                }
            }
            // identify purely new users and fetch course structure
            const purelyNewUserIds = newUserIds.filter((id) => !currentCourseValuesMap.has(id));
            let trainingTopics = [];
            let classesByTopicId = new Map();
            if (purelyNewUserIds.length > 0) {
                {
                    trainingTopics =
                        await this.trainingTopicRepository.findByCourseId(courseId);
                    if (trainingTopics.length > 0) {
                        const topicIds = trainingTopics.map((t) => t.topic_id);
                        classesByTopicId =
                            await this.classRepository.findClassesGroupedByTopic(topicIds);
                    }
                }
                // process new users (create full progress structure)
                for (const userId of purelyNewUserIds) {
                    const user = usersToGrantAccess.find((u) => u.user_id === userId);
                    if (!user)
                        continue;
                    // a) create CourseUserValue for the user
                    const newCourseUserValue = new CourseUserValue_entity_1.CourseUserValue();
                    newCourseUserValue.user = user;
                    newCourseUserValue.user_id = user.user_id;
                    newCourseUserValue.course = course;
                    newCourseUserValue.course_id = course.course_id;
                    newCourseUserValue.user_availability_status = ES_1.default.ACTIVE;
                    courseValuesToSave.push(newCourseUserValue);
                    // b) create TrainingTopicUserValue and ClassUserValue for the user
                    for (const trainingTopic of trainingTopics) {
                        const classesForThisTopic = classesByTopicId.get(trainingTopic.topic_id) || [];
                        const totalClassesCount = classesForThisTopic.length;
                        const newTrainingTopicUserValue = new TrainingTopicUserValue_entity_1.TrainingTopicUserValue();
                        newTrainingTopicUserValue.user = user;
                        newTrainingTopicUserValue.user_id = user.user_id;
                        newTrainingTopicUserValue.topic = trainingTopic;
                        newTrainingTopicUserValue.topic_id = trainingTopic.topic_id;
                        newTrainingTopicUserValue.courseValue = newCourseUserValue;
                        newTrainingTopicUserValue.course_value_id =
                            newCourseUserValue.course_value_id;
                        newTrainingTopicUserValue.completed_classes_count = 0;
                        newTrainingTopicUserValue.total_classes_count = totalClassesCount;
                        trainingTopicValuesToSave.push(newTrainingTopicUserValue);
                        for (const cls of classesForThisTopic) {
                            const classUserValue = new ClassUserValue_entity_1.ClassUserValue();
                            classUserValue.user = user;
                            classUserValue.user_id = user.user_id;
                            classUserValue.topicValue = newTrainingTopicUserValue;
                            classUserValue.topic_value_id =
                                newTrainingTopicUserValue.topic_value_id;
                            classUserValue.class = cls;
                            classUserValue.class_id = cls.class_id;
                            classUserValue.completion_status = ES_1.default.INCOMPLETE;
                            classUserValuesToSave.push(classUserValue);
                        }
                    }
                }
            }
            if (courseValuesToSave.length > 0) {
                await this.courseValueRepository.saveMany(courseValuesToSave);
            }
            if (trainingTopicValuesToSave.length > 0) {
                await this.trainingTopicValueRepository.saveMany(trainingTopicValuesToSave);
            }
            if (classUserValuesToSave.length > 0) {
                await this.classValueRepository.saveMany(classUserValuesToSave);
            }
            await this.courseRepository.save(course);
        });
    }
    async updateCourseTitle(courseId, title) {
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw new NotFoundError_1.NotFoundError('Course', courseId);
        }
        course.course_name = title;
        await this.courseRepository.save(course);
    }
    async updateCourseDescription(courseId, description) {
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw new NotFoundError_1.NotFoundError('Course', courseId);
        }
        course.course_description = description;
        await this.courseRepository.save(course);
    }
    async getCourses(withUserValues = false) {
        return await this.courseRepository.findAll(withUserValues);
    }
    async getCourseById(courseId) {
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw new NotFoundError_1.NotFoundError('Course', courseId);
        }
        return course;
    }
    async getCourseValues(courseId) {
        return await this.courseValueRepository.findByCourseId(courseId, true);
    }
    async getCoursesWithProgress(userId) {
        const courseUserValues = await this.courseValueRepository.findByUserId(userId);
        if (!courseUserValues || courseUserValues.length === 0) {
            return [];
        }
        const courseIds = courseUserValues.map((cuv) => cuv.course_id);
        // 2 get all ACTIVE topics for these specific courses
        const topicsByCourse = await this.trainingTopicRepository.findActiveTopicsGroupedByCourse(courseIds);
        // 3 get all trainingTopicUserValue progress records for this user and these courses
        const trainingTopicUserValues = await this.trainingTopicValueRepository.findByUserIdAndCourseIds(userId, courseIds);
        // 4 map trainingTopicUserValue progress
        const trainingTopicUserValueProgressMap = new Map();
        trainingTopicUserValues.forEach((tuv) => {
            trainingTopicUserValueProgressMap.set(tuv.topic_id, {
                completed: tuv.completed_classes_count,
                total: tuv.total_classes_count,
            });
        });
        // 5 calculate progress for each course
        const results = [];
        for (const cuv of courseUserValues) {
            const course = cuv.course;
            const courseId = course.course_id;
            const totalTopics = topicsByCourse.get(courseId)?.length || 0;
            let completedTopics = 0;
            if (totalTopics > 0) {
                const topicsInThisCourse = topicsByCourse.get(courseId) || [];
                for (const topic of topicsInThisCourse) {
                    const progress = trainingTopicUserValueProgressMap.get(topic.topic_id);
                    if (progress &&
                        progress.total > 0 &&
                        progress.completed === progress.total) {
                        completedTopics++;
                    }
                }
            }
            const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
            results.push({
                course: course,
                topicValues: cuv.topicValues,
                completedTopics: completedTopics,
                totalTopics: totalTopics,
                completionPercentage: completionPercentage,
            });
        }
        return results;
    }
    async getCreatedCourses(userId) {
        const courses = await this.courseRepository.findAllByAuthorId(userId);
        return courses;
    }
    async getCourseTopicsWithProgress(userId, courseId) {
        const courseUserValue = await this.courseValueRepository.findByCourseIdAndUserId(courseId, userId);
        if (!courseUserValue ||
            courseUserValue.user_availability_status !== ES_1.default.ACTIVE) {
            throw new NotFoundError_1.NotFoundError('Course', courseId);
        }
        // get all topicUserValue records for this user and course
        const trainingTopicUserValues = await this.trainingTopicValueRepository.findByUserIdAndCourseIdWithTopic(userId, courseId);
        // 3 map to the desired output format
        const results = await Promise.all(trainingTopicUserValues.map(async (tuv) => {
            const totalClasses = tuv.total_classes_count || 0;
            const completedClasses = tuv.completed_classes_count || 0;
            const completionPercentage = totalClasses > 0
                ? Math.round((completedClasses / totalClasses) * 100)
                : 0;
            const classExamValues = await Promise.all(tuv.classValues.map(async (cuv) => {
                const examData = await this.examStudentService.getUserExamNoAttemptLimit(cuv.class.class_id, userId);
                return {
                    classUserValue: cuv,
                    examData: examData,
                };
            }));
            return {
                topic: tuv.topic,
                classExamValues: classExamValues,
                completedClasses: completedClasses,
                totalClasses: totalClasses,
                completionPercentage: completionPercentage,
            };
        }));
        return results;
    }
};
exports.CourseService = CourseService;
exports.CourseService = CourseService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ICourseRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.ICourseUserValueRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.ITrainingTopicUserValueRepository)),
    __param(4, (0, inversify_1.inject)(containerTypes_1.TYPES.ITrainingTopicRepository)),
    __param(5, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassRepository)),
    __param(6, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassUserValueRepository)),
    __param(7, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamStudentService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], CourseService);
//# sourceMappingURL=course.service.js.map