"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const inversify_1 = require("inversify");
const role_repository_1 = require("../../modules/internal/users/repositories/role.repository");
const role_service_1 = require("../../modules/internal/users/services/role.service");
const roles_controller_1 = require("../../modules/internal/users/controllers/roles.controller");
const containerTypes_1 = require("./containerTypes");
const permission_repository_1 = require("../../modules/internal/users/repositories/permission.repository");
const permission_service_1 = require("../../modules/internal/users/services/permission.service");
const permissions_controller_1 = require("../../modules/internal/users/controllers/permissions.controller");
const user_repository_1 = require("../../modules/internal/users/repositories/user.repository");
const user_service_1 = require("../../modules/internal/users/services/user.service");
const users_controller_1 = __importDefault(require("../../modules/internal/users/controllers/users.controller"));
const documents_repository_1 = require("../../modules/internal/documents/repositories/documents.repository");
const documents_service_1 = require("../../modules/internal/documents/services/documents.service");
const userReportsTo_repository_1 = require("../../modules/internal/users/repositories/userReportsTo.repository");
const userReportsTo_service_1 = require("../../modules/internal/users/services/userReportsTo.service");
const userReportsTo_controller_1 = require("../../modules/internal/users/controllers/userReportsTo.controller");
const assignment_repository_1 = require("../../modules/internal/users/repositories/assignment.repository");
const assignment_service_1 = require("../../modules/internal/users/services/assignment.service");
const assignments_controller_1 = require("../../modules/internal/users/controllers/assignments.controller");
const client_repository_1 = require("../../modules/external/knowledgeBase/repositories/client.repository");
const client_service_1 = require("../../modules/external/knowledgeBase/services/client.service");
const clients_controller_1 = require("../../modules/external/knowledgeBase/controllers/clients.controller");
const topic_repository_1 = require("../../modules/external/knowledgeBase/repositories/topic.repository");
const topic_service_1 = require("../../modules/external/knowledgeBase/services/topic.service");
const topics_controller_1 = require("../../modules/external/knowledgeBase/controllers/topics.controller");
const article_repository_1 = require("../../modules/external/knowledgeBase/repositories/article.repository");
const article_service_1 = require("../../modules/external/knowledgeBase/services/article.service");
const articles_controller_1 = require("../../modules/external/knowledgeBase/controllers/articles.controller");
const tag_repository_1 = require("../../modules/external/knowledgeBase/repositories/tag.repository");
const tag_service_1 = require("../../modules/external/knowledgeBase/services/tag.service");
const tags_controller_1 = require("../../modules/external/knowledgeBase/controllers/tags.controller");
const announcement_repository_1 = require("../../modules/external/announcements/repositories/announcement.repository");
const announcement_service_1 = require("../../modules/external/announcements/services/announcement.service");
const announcements_controller_1 = require("../../modules/external/announcements/controllers/announcements.controller");
const announcementAcknowledgement_repository_1 = require("../../modules/external/announcements/repositories/announcementAcknowledgement.repository");
const customField_repository_1 = require("../../modules/internal/users/repositories/customField.repository");
const customField_service_1 = require("../../modules/internal/users/services/customField.service");
const customField_controller_1 = require("../../modules/internal/users/controllers/customField.controller");
const staffDirectoryOrder_repository_1 = require("../../modules/external/humanResources/repositories/staffDirectoryOrder.repository");
const staffDirectoryOrder_service_1 = require("../../modules/external/humanResources/services/staffDirectoryOrder.service");
const staffDirectoryOrders_controller_1 = require("../../modules/external/humanResources/controllers/staffDirectoryOrders.controller");
const externalValidation_service_1 = require("../../modules/internal/users/services/externalValidation.service");
const course_repository_1 = require("../../modules/external/training/repositories/course.repository");
const trainingTopic_repository_1 = require("../../modules/external/training/repositories/trainingTopic.repository");
const course_service_1 = require("../../modules/external/training/services/course.service");
const trainingTopic_service_1 = require("../../modules/external/training/services/trainingTopic.service");
const courses_controller_1 = require("../../modules/external/training/controllers/courses.controller");
const trainingTopics_controller_1 = require("../../modules/external/training/controllers/trainingTopics.controller");
const class_repository_1 = require("../../modules/external/training/repositories/class.repository");
const class_service_1 = require("../../modules/external/training/services/class.service");
const classes_controller_1 = require("../../modules/external/training/controllers/classes.controller");
const courseUserValue_repository_1 = require("../../modules/external/training/repositories/courseUserValue.repository");
const trainingTopicUserValue_repository_1 = require("../../modules/external/training/repositories/trainingTopicUserValue.repository");
const classUserValue_repository_1 = require("../../modules/external/training/repositories/classUserValue.repository");
const comment_repository_1 = require("../../modules/external/training/repositories/comment.repository");
const auth_service_1 = require("../../modules/internal/auth/services/auth.service");
const auth_controller_1 = require("../../modules/internal/auth/controllers/auth.controller");
const exams_controller_1 = require("../../modules/external/training/controllers/exams.controller");
const exam_repository_1 = require("../../modules/external/training/repositories/exam.repository");
const exam_service_1 = require("../../modules/external/training/services/exam.service");
const question_repository_1 = require("../../modules/external/training/repositories/question.repository");
const question_service_1 = require("../../modules/external/training/services/question.service");
const questions_controller_1 = require("../../modules/external/training/controllers/questions.controller");
const option_repository_1 = require("../../modules/external/training/repositories/option.repository");
const option_service_1 = require("../../modules/external/training/services/option.service");
const questionType_repository_1 = require("../../modules/external/training/repositories/questionType.repository");
const options_controller_1 = require("../../modules/external/training/controllers/options.controller");
const questionType_service_1 = require("../../modules/external/training/services/questionType.service");
const questionTypes_controller_1 = require("../../modules/external/training/controllers/questionTypes.controller");
const userExamAttempt_repository_1 = require("../../modules/external/training/repositories/userExamAttempt.repository");
const userAnswer_repository_1 = require("../../modules/external/training/repositories/userAnswer.repository");
const userExamAttempt_service_1 = require("../../modules/external/training/services/userExamAttempt.service");
const userExamAttempts_controller_1 = require("../../modules/external/training/controllers/userExamAttempts.controller");
const announcementRead_repository_1 = require("../../modules/external/announcements/repositories/announcementRead.repository");
const documents_controller_1 = require("../../modules/internal/documents/controllers/documents.controller");
const container = new inversify_1.Container();
exports.container = container;
// Binding interfaces to implementations
container.bind(containerTypes_1.TYPES.IRoleRepository).to(role_repository_1.RoleRepository);
container.bind(containerTypes_1.TYPES.IRoleService).to(role_service_1.RoleService);
container.bind(roles_controller_1.RoleController).toSelf();
container
    .bind(containerTypes_1.TYPES.IPermissionRepository)
    .to(permission_repository_1.PermissionRepository);
container
    .bind(containerTypes_1.TYPES.IPermissionService)
    .to(permission_service_1.PermissionService);
container.bind(permissions_controller_1.PermissionController).toSelf();
container.bind(containerTypes_1.TYPES.IUserRepository).to(user_repository_1.UserRepository);
container.bind(containerTypes_1.TYPES.IUserService).to(user_service_1.UserService);
container.bind(users_controller_1.default).toSelf();
container
    .bind(containerTypes_1.TYPES.IDocumentRepository)
    .to(documents_repository_1.DocumentRepository);
container.bind(containerTypes_1.TYPES.IDocumentService).to(documents_service_1.DocumentService);
container.bind(documents_controller_1.DocumentController).toSelf();
container
    .bind(containerTypes_1.TYPES.IUserReportsToRepository)
    .to(userReportsTo_repository_1.UserReportsToRepository);
container
    .bind(containerTypes_1.TYPES.IUserReportsToService)
    .to(userReportsTo_service_1.UserReportsToService);
container.bind(userReportsTo_controller_1.UserReportsToController).toSelf();
container
    .bind(containerTypes_1.TYPES.IAssignmentRepository)
    .to(assignment_repository_1.AssignmentRepository);
container
    .bind(containerTypes_1.TYPES.IAssignmentService)
    .to(assignment_service_1.AssignmentService);
container.bind(assignments_controller_1.AssignmentController).toSelf();
container.bind(containerTypes_1.TYPES.IClientRepository).to(client_repository_1.ClientRepository);
container.bind(containerTypes_1.TYPES.IClientService).to(client_service_1.ClientService);
container.bind(clients_controller_1.ClientController).toSelf();
container.bind(containerTypes_1.TYPES.ITopicRepository).to(topic_repository_1.TopicRepository);
container.bind(containerTypes_1.TYPES.ITopicService).to(topic_service_1.TopicService);
container.bind(topics_controller_1.TopicController).toSelf();
container
    .bind(containerTypes_1.TYPES.IArticleRepository)
    .to(article_repository_1.ArticleRepository);
container.bind(containerTypes_1.TYPES.IArticleService).to(article_service_1.ArticleService);
container.bind(articles_controller_1.ArticleController).toSelf();
container.bind(containerTypes_1.TYPES.ITagRepository).to(tag_repository_1.TagRepository);
container.bind(containerTypes_1.TYPES.ITagService).to(tag_service_1.TagService);
container.bind(tags_controller_1.TagController).toSelf();
container
    .bind(containerTypes_1.TYPES.IAnnouncementRepository)
    .to(announcement_repository_1.AnnouncementRepository);
container
    .bind(containerTypes_1.TYPES.IAnnouncementService)
    .to(announcement_service_1.AnnouncementService);
container.bind(announcements_controller_1.AnnouncementController).toSelf();
container
    .bind(containerTypes_1.TYPES.IAnnouncementAcknowledgementRepository)
    .to(announcementAcknowledgement_repository_1.AnnouncementAcknowledgementRepository);
container
    .bind(containerTypes_1.TYPES.IAnnouncementReadRepository)
    .to(announcementRead_repository_1.AnnouncementReadRepository);
container
    .bind(containerTypes_1.TYPES.ICustomFieldRepository)
    .to(customField_repository_1.CustomFieldRepository);
container
    .bind(containerTypes_1.TYPES.ICustomFieldService)
    .to(customField_service_1.CustomFieldService);
container.bind(customField_controller_1.CustomFieldController).toSelf();
container
    .bind(containerTypes_1.TYPES.IStaffDirectoryOrderRepository)
    .to(staffDirectoryOrder_repository_1.StaffDirectoryOrderRepository);
container
    .bind(containerTypes_1.TYPES.IStaffDirectoryOrderService)
    .to(staffDirectoryOrder_service_1.StaffDirectoryOrderService);
container
    .bind(staffDirectoryOrders_controller_1.StaffDirectoryOrderController)
    .toSelf();
container
    .bind(containerTypes_1.TYPES.ExternalValidationService)
    .to(externalValidation_service_1.ExternalValidationService);
container.bind(containerTypes_1.TYPES.AuthService).to(auth_service_1.AuthService);
container.bind(auth_controller_1.AuthController).toSelf();
container.bind(containerTypes_1.TYPES.ICourseRepository).to(course_repository_1.CourseRepository);
container.bind(containerTypes_1.TYPES.ICourseService).to(course_service_1.CourseService);
container.bind(courses_controller_1.CourseController).toSelf();
container
    .bind(containerTypes_1.TYPES.ICourseUserValueRepository)
    .to(courseUserValue_repository_1.CourseUserValueRepository);
container
    .bind(containerTypes_1.TYPES.ITrainingTopicRepository)
    .to(trainingTopic_repository_1.TrainingTopicRepository);
container
    .bind(containerTypes_1.TYPES.ITrainingTopicService)
    .to(trainingTopic_service_1.TrainingTopicService);
container.bind(trainingTopics_controller_1.TrainingTopicController).toSelf();
container
    .bind(containerTypes_1.TYPES.ITrainingTopicUserValueRepository)
    .to(trainingTopicUserValue_repository_1.TrainingTopicUserValueRepository);
container.bind(containerTypes_1.TYPES.IClassRepository).to(class_repository_1.ClassRepository);
container.bind(containerTypes_1.TYPES.IClassService).to(class_service_1.ClassService);
container.bind(classes_controller_1.ClassController).toSelf();
container
    .bind(containerTypes_1.TYPES.IClassUserValueRepository)
    .to(classUserValue_repository_1.ClassUserValueRepository);
container
    .bind(containerTypes_1.TYPES.ICommentRepository)
    .to(comment_repository_1.CommentRepository);
container.bind(containerTypes_1.TYPES.IExamRepository).to(exam_repository_1.ExamRepository);
container.bind(containerTypes_1.TYPES.IExamService).to(exam_service_1.ExamService);
container.bind(exams_controller_1.ExamController).toSelf();
container
    .bind(containerTypes_1.TYPES.IQuestionRepository)
    .to(question_repository_1.QuestionRepository);
container.bind(containerTypes_1.TYPES.IQuestionService).to(question_service_1.QuestionService);
container.bind(questions_controller_1.QuestionController).toSelf();
container
    .bind(containerTypes_1.TYPES.IQuestionTypeRepository)
    .to(questionType_repository_1.QuestionTypeRepository);
container
    .bind(containerTypes_1.TYPES.IQuestionTypeService)
    .to(questionType_service_1.QuestionTypeService);
container.bind(questionTypes_controller_1.QuestionTypeController).toSelf();
container.bind(containerTypes_1.TYPES.IOptionRepository).to(option_repository_1.OptionRepository);
container.bind(containerTypes_1.TYPES.IOptionService).to(option_service_1.OptionService);
container.bind(options_controller_1.OptionController).toSelf();
container
    .bind(containerTypes_1.TYPES.IUserExamAttemptRepository)
    .to(userExamAttempt_repository_1.UserExamAttemptRepository);
container
    .bind(containerTypes_1.TYPES.IUserExamAttemptService)
    .to(userExamAttempt_service_1.UserExamAttemptService);
container.bind(userExamAttempts_controller_1.UserExamAttemptController).toSelf();
container
    .bind(containerTypes_1.TYPES.IUserAnswerRepository)
    .to(userAnswer_repository_1.UserAnswerRepository);
//# sourceMappingURL=inversify.config.js.map