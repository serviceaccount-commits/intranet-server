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
exports.ClassService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const Class_entity_1 = require("../entities/Class.entity");
const CreateClassSchema_1 = require("../schema/classes/CreateClassSchema");
const data_source_1 = require("../../../../shared/database/data-source");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
// import { ConflictError } from '../../../../shared/errors/ConflictError';
const UpdateClassSchema_1 = require("../schema/classes/UpdateClassSchema");
const CreateCommentSchema_1 = require("../schema/comments/CreateCommentSchema");
const Comment_entity_1 = require("../entities/Comment.entity");
const UpdateCommentSchema_1 = require("../schema/comments/UpdateCommentSchema");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const ClassUserValue_entity_1 = require("../entities/ClassUserValue.entity");
let ClassService = class ClassService {
    classRepository;
    courseRepository;
    userRepository;
    trainingTopicRepository;
    commentRepository;
    trainingTopicUserValueRepository;
    classUserValueRepository;
    documentService;
    examAdminService;
    examStudentService;
    examRepository;
    constructor(classRepository, courseRepository, userRepository, trainingTopicRepository, commentRepository, trainingTopicUserValueRepository, classUserValueRepository, documentService, examAdminService, examStudentService, examRepository) {
        this.classRepository = classRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.trainingTopicRepository = trainingTopicRepository;
        this.commentRepository = commentRepository;
        this.trainingTopicUserValueRepository = trainingTopicUserValueRepository;
        this.classUserValueRepository = classUserValueRepository;
        this.documentService = documentService;
        this.examAdminService = examAdminService;
        this.examStudentService = examStudentService;
        this.examRepository = examRepository;
    }
    async createClass(input) {
        const validatedData = CreateClassSchema_1.CreateClassSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const existingTrainingTopic = await this.trainingTopicRepository.findById(validatedData.topicId);
            if (!existingTrainingTopic) {
                throw new NotFoundError_1.NotFoundError('Training topic', validatedData.topicId);
            }
            const course = await this.courseRepository.findById(existingTrainingTopic.course_id);
            if (course) {
                course.updated_at = new Date();
                await this.courseRepository.save(course);
            }
            const existingUser = await this.userRepository.findUserById(validatedData.userId);
            if (!existingUser) {
                throw new NotFoundError_1.NotFoundError('User', validatedData.userId);
            }
            // const existingClass = await this.classRepository.findByName(
            //   validatedData.className,
            // );
            // if (existingClass) {
            //   throw new ConflictError(
            //     `Class with name ${validatedData.className} already exists.`,
            //   );
            // }
            const document = await this.documentService.createClassDocument(validatedData.content);
            const newClass = new Class_entity_1.Class();
            newClass.class_name = validatedData.className;
            newClass.class_description = validatedData.classDescription;
            newClass.private_comments = validatedData.privateComments;
            newClass.user = existingUser;
            newClass.user_id = validatedData.userId;
            newClass.topic = existingTrainingTopic;
            newClass.topic_id = validatedData.topicId;
            newClass.class_status = ES_1.default.PUBLISHED;
            newClass.document = document;
            newClass.document_id = document.document_id;
            const classEntity = await this.classRepository.create(newClass);
            const trainingTopicUserValues = await this.trainingTopicUserValueRepository.findByTopicId(validatedData.topicId, false);
            const newClassUserValues = [];
            for (const topicUserValue of trainingTopicUserValues) {
                const newClassUserValue = new ClassUserValue_entity_1.ClassUserValue();
                newClassUserValue.user = topicUserValue.user;
                newClassUserValue.user_id = topicUserValue.user_id;
                newClassUserValue.class = classEntity;
                newClassUserValue.class_id = classEntity.class_id;
                newClassUserValue.topicValue = topicUserValue;
                newClassUserValue.topic_value_id = topicUserValue.topic_value_id;
                newClassUserValue.completion_status = ES_1.default.INCOMPLETE;
                newClassUserValues.push(newClassUserValue);
                topicUserValue.total_classes_count += 1;
                await this.trainingTopicUserValueRepository.save(topicUserValue);
            }
            if (newClassUserValues.length > 0) {
                await this.classUserValueRepository.saveMany(newClassUserValues);
            }
            return classEntity;
        });
    }
    async updateClass(classId, input) {
        const validatedData = UpdateClassSchema_1.UpdateClassSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const existingClass = await this.classRepository.findById(classId);
            if (!existingClass) {
                throw new NotFoundError_1.NotFoundError('Class', classId);
            }
            const course = await this.courseRepository.findById(existingClass.topic.course_id);
            if (course) {
                course.updated_at = new Date();
                await this.courseRepository.save(course);
            }
            const classStatus = existingClass.class_status;
            const newStatus = validatedData.classStatus;
            const nameChanged = existingClass.class_name !== validatedData.className;
            existingClass.class_name = validatedData.className;
            existingClass.class_description = validatedData.classDescription;
            if (existingClass.private_comments !== validatedData.privateComments) {
                existingClass.private_comments = validatedData.privateComments;
            }
            if (classStatus != newStatus) {
                existingClass.class_status = newStatus;
            }
            if (classStatus !== validatedData.classStatus) {
                const trainingTopicUserValues = await this.trainingTopicUserValueRepository.findByTopicId(existingClass.topic_id, false);
                let countChange = 0;
                if (classStatus === ES_1.default.DRAFT && newStatus === ES_1.default.PUBLISHED) {
                    countChange = 1;
                }
                else if (classStatus === ES_1.default.DRAFT && newStatus === ES_1.default.ARCHIVED) {
                    countChange = 0;
                }
                else if (classStatus === ES_1.default.PUBLISHED && newStatus === ES_1.default.DRAFT) {
                    countChange = -1;
                }
                else if (classStatus === ES_1.default.PUBLISHED && newStatus === ES_1.default.ARCHIVED)
                    countChange = -1;
                else if (classStatus === ES_1.default.ARCHIVED && newStatus === ES_1.default.PUBLISHED)
                    countChange = 1;
                else if (classStatus === ES_1.default.ARCHIVED && newStatus === ES_1.default.DRAFT)
                    countChange = 0;
                if (countChange !== 0 && trainingTopicUserValues.length > 0) {
                    for (const topicUserValue of trainingTopicUserValues) {
                        topicUserValue.total_classes_count += countChange;
                        if (topicUserValue.total_classes_count < 0) {
                            topicUserValue.total_classes_count = 0;
                        }
                    }
                    await this.trainingTopicUserValueRepository.saveMany(trainingTopicUserValues);
                }
            }
            // await this.documentService.updateLocalDocument(
            //   existingClass.document_id,
            //   'classes',
            //   validatedData.content,
            // );
            await this.documentService.uploadDocumentToS3(existingClass.document_id, 'classes', validatedData.content);
            // IF NAME CHANGED UPDATE ALL EXAMS UNDER THIS CLASS TO GET THE NAME TO "Exam For ${newClassName}"
            if (nameChanged) {
                const allExams = await this.examAdminService.getAllClassExams(classId);
                let examsToSave = [];
                for (const exam of allExams) {
                    exam.exam_title = `Exam for ${validatedData.className}`;
                    examsToSave.push(exam);
                }
                await this.examRepository.saveMany(examsToSave);
            }
            return await this.classRepository.save(existingClass);
        });
    }
    async updateClassUserValue(classId, userId, completionStatus) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const classUserValue = await this.classUserValueRepository.findByClassIdAndUserId(classId, userId);
            if (!classUserValue) {
                throw new NotFoundError_1.NotFoundError('ClassUserValue', classId);
            }
            const trainingTopicUserValue = classUserValue.topicValue;
            const originalStatus = classUserValue.completion_status;
            if (originalStatus === completionStatus) {
                return;
            }
            if (classUserValue.completion_status === completionStatus) {
                return;
            }
            if (classUserValue.completion_status === ES_1.default.COMPLETED &&
                completionStatus === ES_1.default.INCOMPLETE &&
                trainingTopicUserValue.total_classes_count > 0) {
                trainingTopicUserValue.completed_classes_count -= 1;
            }
            else if (classUserValue.completion_status === ES_1.default.INCOMPLETE &&
                completionStatus === ES_1.default.COMPLETED) {
                trainingTopicUserValue.completed_classes_count += 1;
            }
            classUserValue.completion_status = completionStatus;
            await this.trainingTopicUserValueRepository.save(trainingTopicUserValue);
            await this.classUserValueRepository.save(classUserValue);
        });
    }
    async getClasses(topicId) {
        return await this.classRepository.findByTopicId(topicId);
    }
    async getClassById(classId) {
        const classEntity = await this.classRepository.findById(classId);
        if (!classEntity) {
            throw new NotFoundError_1.NotFoundError('Class', classId);
        }
        // const fileContent = await this.documentService.getLocalDocument(
        //   classEntity.document_id,
        //   'classes',
        // );
        const fileContent = await this.documentService.getDocumentFromS3(classEntity.document_id, 'classes');
        return { class: classEntity, content: fileContent };
    }
    async getClassByIdWithUserValueAndExam(classId, userId) {
        const classEntity = await this.classRepository.findById(classId);
        if (!classEntity) {
            throw new NotFoundError_1.NotFoundError('Class', classId);
        }
        const userValue = await this.classUserValueRepository.findByClassIdAndUserId(classId, userId);
        if (!userValue) {
            0;
            throw new NotFoundError_1.NotFoundError('Class User Value', classId);
        }
        // const fileContent = await this.documentService.getLocalDocument(
        //   classEntity.document_id,
        //   'classes',
        // );
        const fileContent = await this.documentService.getDocumentFromS3(classEntity.document_id, 'classes');
        return {
            classData: {
                class: classEntity,
                content: fileContent,
                userValue: userValue,
            },
            userExamStatus: await this.examStudentService.getUserExamStatus(classId, userId),
        };
    }
    async addCommentToClass(classId, input) {
        const validatedData = CreateCommentSchema_1.CreateCommentSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const trainingClass = await this.classRepository.findById(classId);
            if (!trainingClass) {
                throw new NotFoundError_1.NotFoundError('Class', classId);
            }
            const user = await this.userRepository.findUserById(validatedData.userId);
            if (!user) {
                throw new NotFoundError_1.NotFoundError('User', validatedData.userId);
            }
            const newComment = new Comment_entity_1.Comment();
            newComment.comment_content = validatedData.commentContent;
            newComment.comment_status = validatedData.commentStatus;
            newComment.user = user;
            newComment.user_id = validatedData.userId;
            trainingClass.comments = [...(trainingClass.comments || []), newComment];
            await this.commentRepository.create(newComment);
            await this.classRepository.save(trainingClass);
        });
    }
    async updateComment(commentId, input) {
        const validatedData = UpdateCommentSchema_1.UpdateCommentSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const comment = await this.commentRepository.findById(commentId);
            if (!comment) {
                throw new NotFoundError_1.NotFoundError('Comment', commentId);
            }
            comment.comment_content = validatedData.commentContent;
            comment.comment_status = validatedData.commentStatus;
            await this.commentRepository.save(comment);
        });
    }
    async getClassActiveComments(classId) {
        return await this.commentRepository.findActiveByClassId(classId);
    }
    async getCommentById(commentId) {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) {
            throw new NotFoundError_1.NotFoundError('Comment', commentId);
        }
        return comment;
    }
    async getComments(classId) {
        return await this.commentRepository.findAll(classId);
    }
};
exports.ClassService = ClassService;
exports.ClassService = ClassService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.ICourseRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __param(3, (0, inversify_1.inject)(containerTypes_1.TYPES.ITrainingTopicRepository)),
    __param(4, (0, inversify_1.inject)(containerTypes_1.TYPES.ICommentRepository)),
    __param(5, (0, inversify_1.inject)(containerTypes_1.TYPES.ITrainingTopicUserValueRepository)),
    __param(6, (0, inversify_1.inject)(containerTypes_1.TYPES.IClassUserValueRepository)),
    __param(7, (0, inversify_1.inject)(containerTypes_1.TYPES.IDocumentService)),
    __param(8, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamAdminService)),
    __param(9, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamStudentService)),
    __param(10, (0, inversify_1.inject)(containerTypes_1.TYPES.IExamRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ClassService);
//# sourceMappingURL=class.service.js.map