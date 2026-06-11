import { Container } from 'inversify';
import { IRoleRepository } from '../../modules/internal/users/interfaces/roles/role.repository.interface';
import { RoleRepository } from '../../modules/internal/users/repositories/role.repository';
import { IRoleService } from '../../modules/internal/users/interfaces/roles/role.service.interface';
import { RoleService } from '../../modules/internal/users/services/role.service';
import { RoleController } from '../../modules/internal/users/controllers/roles.controller';
import { TYPES } from './containerTypes';
import { IPermissionRepository } from '../../modules/internal/users/interfaces/permissions/permission.repository.interface';
import { PermissionRepository } from '../../modules/internal/users/repositories/permission.repository';
import { IPermissionService } from '../../modules/internal/users/interfaces/permissions/permission.service.interface';
import { PermissionService } from '../../modules/internal/users/services/permission.service';
import { PermissionController } from '../../modules/internal/users/controllers/permissions.controller';
import { IUserRepository } from '../../modules/internal/users/interfaces/users/user.repository.interface';
import { UserRepository } from '../../modules/internal/users/repositories/user.repository';
import { IUserService } from '../../modules/internal/users/interfaces/users/user.service.interface';
import { UserService } from '../../modules/internal/users/services/user.service';
import UserController from '../../modules/internal/users/controllers/users.controller';
import { IDocumentRepository } from '../../modules/internal/documents/interfaces/documents.repository.interface';
import { DocumentRepository } from '../../modules/internal/documents/repositories/documents.repository';
import { IDocumentService } from '../../modules/internal/documents/interfaces/documents.service.interface';
import { DocumentService } from '../../modules/internal/documents/services/documents.service';
import { UserReportsToRepository } from '../../modules/internal/users/repositories/userReportsTo.repository';
import { IUserReportsToRepository } from '../../modules/internal/users/interfaces/userReportsTo/userReportsTo.repository.interface';
import { IUserReportsToService } from '../../modules/internal/users/interfaces/userReportsTo/userReportsTo.service.interface';
import { UserReportsToService } from '../../modules/internal/users/services/userReportsTo.service';
import { UserReportsToController } from '../../modules/internal/users/controllers/userReportsTo.controller';
import { IAssignmentRepository } from '../../modules/internal/users/interfaces/assignments/assignment.repository.interface';
import { AssignmentRepository } from '../../modules/internal/users/repositories/assignment.repository';
import { AssignmentService } from '../../modules/internal/users/services/assignment.service';
import { IAssignmentService } from '../../modules/internal/users/interfaces/assignments/assignment.service.interface';
import { AssignmentController } from '../../modules/internal/users/controllers/assignments.controller';
import { IClientRepository } from '../../modules/external/knowledgeBase/interfaces/clients/client.repository.interface';
import { ClientRepository } from '../../modules/external/knowledgeBase/repositories/client.repository';
import { IClientService } from '../../modules/external/knowledgeBase/interfaces/clients/client.service.interface';
import { ClientService } from '../../modules/external/knowledgeBase/services/client.service';
import { ClientController } from '../../modules/external/knowledgeBase/controllers/clients.controller';
import { ITopicRepository } from '../../modules/external/knowledgeBase/interfaces/topics/topic.repository.interface';
import { TopicRepository } from '../../modules/external/knowledgeBase/repositories/topic.repository';
import { ITopicService } from '../../modules/external/knowledgeBase/interfaces/topics/topic.service.interface';
import { TopicService } from '../../modules/external/knowledgeBase/services/topic.service';
import { TopicController } from '../../modules/external/knowledgeBase/controllers/topics.controller';
import { IArticleRepository } from '../../modules/external/knowledgeBase/interfaces/articles/article.repository.interface';
import { ArticleRepository } from '../../modules/external/knowledgeBase/repositories/article.repository';
import { IArticleService } from '../../modules/external/knowledgeBase/interfaces/articles/article.service.interface';
import { ArticleService } from '../../modules/external/knowledgeBase/services/article.service';
import { ArticleController } from '../../modules/external/knowledgeBase/controllers/articles.controller';
import { ManageArticlesController } from '../../modules/external/knowledgeBase/controllers/manage-articles.controller';
import { IArticleChunkRepository } from '../../modules/external/knowledgeBase/interfaces/articles/articleChunk.repository.interface';
import { ArticleChunkRepository } from '../../modules/external/knowledgeBase/repositories/articleChunk.repository';
import { ArticleChunkingService } from '../../modules/external/knowledgeBase/services/articleChunking.service';
import { ArticleSearchService } from '../../modules/external/knowledgeBase/services/articleSearch.service';
import { ITagRepository } from '../../modules/external/knowledgeBase/interfaces/tags/tag.repository.interface';
import { TagRepository } from '../../modules/external/knowledgeBase/repositories/tag.repository';
import { ITagService } from '../../modules/external/knowledgeBase/interfaces/tags/tag.service.interface';
import { TagService } from '../../modules/external/knowledgeBase/services/tag.service';
import { TagController } from '../../modules/external/knowledgeBase/controllers/tags.controller';
import { IAnnouncementRepository } from '../../modules/external/announcements/interfaces/announcements/announcement.repository.interface';
import { AnnouncementRepository } from '../../modules/external/announcements/repositories/announcement.repository';
import { IAnnouncementInboxService } from '../../modules/external/announcements/interfaces/announcements/announcement-inbox.service.interface';
import { AnnouncementInboxService } from '../../modules/external/announcements/services/announcement-inbox.service';
import { IAnnouncementManagementService } from '../../modules/external/announcements/interfaces/announcements/announcement-management.service.interface';
import { AnnouncementManagementService } from '../../modules/external/announcements/services/announcement-management.service';
import { IAnnouncementEngagementService } from '../../modules/external/announcements/interfaces/announcements/announcement-engagement.service.interface';
import { AnnouncementEngagementService } from '../../modules/external/announcements/services/announcement-engagement.service';
import { AnnouncementController } from '../../modules/external/announcements/controllers/announcements.controller';
import { IAnnouncementAcknowledgementRepository } from '../../modules/external/announcements/interfaces/announcements/announcementAcknowledgement.repository.interface';
import { AnnouncementAcknowledgementRepository } from '../../modules/external/announcements/repositories/announcementAcknowledgement.repository';
import ICustomFieldRepository from '../../modules/internal/users/interfaces/users/customField.repository.interface';
import { CustomFieldRepository } from '../../modules/internal/users/repositories/customField.repository';
import { ICustomFieldService } from '../../modules/internal/users/interfaces/customFields/customField.service.interface';
import { CustomFieldService } from '../../modules/internal/users/services/customField.service';
import { CustomFieldController } from '../../modules/internal/users/controllers/customField.controller';
import { IStaffDirectoryOrderRepository } from '../../modules/external/humanResources/interfaces/staffDirectoryOrders/staffDirectoryOrder.repository.interface';
import { StaffDirectoryOrderRepository } from '../../modules/external/humanResources/repositories/staffDirectoryOrder.repository';
import { IStaffDirectoryOrderService } from '../../modules/external/humanResources/interfaces/staffDirectoryOrders/staffDirectoryOrder.service.interface';
import { StaffDirectoryOrderService } from '../../modules/external/humanResources/services/staffDirectoryOrder.service';
import { StaffDirectoryOrderController } from '../../modules/external/humanResources/controllers/staffDirectoryOrders.controller';
import { ExternalValidationService } from '../../modules/internal/users/services/externalValidation.service';
import { ICourseRepository } from '../../modules/external/training/interfaces/courses/course.repository.interface';
import { CourseRepository } from '../../modules/external/training/repositories/course.repository';
import { ITrainingTopicRepository } from '../../modules/external/training/interfaces/trainingTopics/trainingTopic.repository.interface';
import { TrainingTopicRepository } from '../../modules/external/training/repositories/trainingTopic.repository';
import { ICourseService } from '../../modules/external/training/interfaces/courses/course.service.interface';
import { CourseService } from '../../modules/external/training/services/course.service';
import { TrainingTopicService } from '../../modules/external/training/services/trainingTopic.service';
import { ITrainingTopicService } from '../../modules/external/training/interfaces/trainingTopics/trainingTopic.service.interface';
import { CourseController } from '../../modules/external/training/controllers/courses.controller';
import { TrainingTopicController } from '../../modules/external/training/controllers/trainingTopics.controller';
import { IClassRepository } from '../../modules/external/training/interfaces/classes/class.repository.interface';
import { ClassRepository } from '../../modules/external/training/repositories/class.repository';
import { IClassService } from '../../modules/external/training/interfaces/classes/class.service.interface';
import { ClassService } from '../../modules/external/training/services/class.service';
import { ClassController } from '../../modules/external/training/controllers/classes.controller';
import { ICourseUserValueRepository } from '../../modules/external/training/interfaces/courses/courseUserValue.repository.interface';
import { CourseUserValueRepository } from '../../modules/external/training/repositories/courseUserValue.repository';
import { ITrainingTopicUserValueRepository } from '../../modules/external/training/interfaces/trainingTopics/trainingTopicUserValue.repository.interface';
import { TrainingTopicUserValueRepository } from '../../modules/external/training/repositories/trainingTopicUserValue.repository';
import { IClassUserValueRepository } from '../../modules/external/training/interfaces/classes/classUserValue.repository.interface';
import { ClassUserValueRepository } from '../../modules/external/training/repositories/classUserValue.repository';
import { ICommentRepository } from '../../modules/external/training/interfaces/comments/comment.repository.interface';
import { CommentRepository } from '../../modules/external/training/repositories/comment.repository';
import { AuthService } from '../../modules/internal/auth/services/auth.service';
import { AuthController } from '../../modules/internal/auth/controllers/auth.controller';
import { ExamController } from '../../modules/external/training/controllers/exams.controller';
import { IExamRepository } from '../../modules/external/training/interfaces/exams/exam.repository.interface';
import { ExamRepository } from '../../modules/external/training/repositories/exam.repository';
import { IExamAdminService } from '../../modules/external/training/interfaces/exams/exam-admin.service.interface';
import { ExamAdminService } from '../../modules/external/training/services/exam-admin.service';
import { IExamStudentService } from '../../modules/external/training/interfaces/exams/exam-student.service.interface';
import { ExamStudentService } from '../../modules/external/training/services/exam-student.service';
import { IExamStandaloneService } from '../../modules/external/training/interfaces/exams/exam-standalone.service.interface';
import { ExamStandaloneService } from '../../modules/external/training/services/exam-standalone.service';
import { IQuestionRepository } from '../../modules/external/training/interfaces/questions/question.repository.interface';
import { QuestionRepository } from '../../modules/external/training/repositories/question.repository';
import { IQuestionService } from '../../modules/external/training/interfaces/questions/question.service.interface';
import { QuestionService } from '../../modules/external/training/services/question.service';
import { QuestionController } from '../../modules/external/training/controllers/questions.controller';
import { IOptionRepository } from '../../modules/external/training/interfaces/options/option.repository.interface';
import { OptionRepository } from '../../modules/external/training/repositories/option.repository';
import { IOptionService } from '../../modules/external/training/interfaces/options/option.service.repository';
import { OptionService } from '../../modules/external/training/services/option.service';
import { IQuestionTypeRepository } from '../../modules/external/training/interfaces/questionTypes/questionType.repository.interface';
import { QuestionTypeRepository } from '../../modules/external/training/repositories/questionType.repository';
import { OptionController } from '../../modules/external/training/controllers/options.controller';
import { IQuestionTypeService } from '../../modules/external/training/interfaces/questionTypes/questionType.service.interface';
import { QuestionTypeService } from '../../modules/external/training/services/questionType.service';
import { QuestionTypeController } from '../../modules/external/training/controllers/questionTypes.controller';
import { IUserExamAttemptRepository } from '../../modules/external/training/interfaces/userExamAttempts/userExamAttempt.repository.interface';
import { UserExamAttemptRepository } from '../../modules/external/training/repositories/userExamAttempt.repository';
import { IUserAnswerRepository } from '../../modules/external/training/interfaces/userAnswers/userAnswer.repository.interface';
import { UserAnswerRepository } from '../../modules/external/training/repositories/userAnswer.repository';
import { IUserExamAttemptService } from '../../modules/external/training/interfaces/userExamAttempts/userExamAttempt.service.interface';
import { UserExamAttemptService } from '../../modules/external/training/services/userExamAttempt.service';
import { UserExamAttemptController } from '../../modules/external/training/controllers/userExamAttempts.controller';
import { IAnnouncementReadRepository } from '../../modules/external/announcements/interfaces/announcements/announcementRead.repository.interface';
import { AnnouncementReadRepository } from '../../modules/external/announcements/repositories/announcementRead.repository';
import { DocumentController } from '../../modules/internal/documents/controllers/documents.controller';

const container = new Container();

// Binding interfaces to implementations
container.bind<IRoleRepository>(TYPES.IRoleRepository).to(RoleRepository);
container.bind<IRoleService>(TYPES.IRoleService).to(RoleService);
container.bind<RoleController>(RoleController).toSelf();

container
  .bind<IPermissionRepository>(TYPES.IPermissionRepository)
  .to(PermissionRepository);
container
  .bind<IPermissionService>(TYPES.IPermissionService)
  .to(PermissionService);
container.bind<PermissionController>(PermissionController).toSelf();

container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
container.bind<IUserService>(TYPES.IUserService).to(UserService);
container.bind<UserController>(UserController).toSelf();

container
  .bind<IDocumentRepository>(TYPES.IDocumentRepository)
  .to(DocumentRepository);
container.bind<IDocumentService>(TYPES.IDocumentService).to(DocumentService);
container.bind<DocumentController>(DocumentController).toSelf();

container
  .bind<IUserReportsToRepository>(TYPES.IUserReportsToRepository)
  .to(UserReportsToRepository);
container
  .bind<IUserReportsToService>(TYPES.IUserReportsToService)
  .to(UserReportsToService);
container.bind<UserReportsToController>(UserReportsToController).toSelf();

container
  .bind<IAssignmentRepository>(TYPES.IAssignmentRepository)
  .to(AssignmentRepository);
container
  .bind<IAssignmentService>(TYPES.IAssignmentService)
  .to(AssignmentService);
container.bind<AssignmentController>(AssignmentController).toSelf();

container.bind<IClientRepository>(TYPES.IClientRepository).to(ClientRepository);
container.bind<IClientService>(TYPES.IClientService).to(ClientService);
container.bind<ClientController>(ClientController).toSelf();

container.bind<ITopicRepository>(TYPES.ITopicRepository).to(TopicRepository);
container.bind<ITopicService>(TYPES.ITopicService).to(TopicService);
container.bind<TopicController>(TopicController).toSelf();

container
  .bind<IArticleRepository>(TYPES.IArticleRepository)
  .to(ArticleRepository);
container.bind<IArticleService>(TYPES.IArticleService).to(ArticleService);
container.bind<ArticleController>(ArticleController).toSelf();
container.bind<ManageArticlesController>(ManageArticlesController).toSelf();

container
  .bind<IArticleChunkRepository>(TYPES.IArticleChunkRepository)
  .to(ArticleChunkRepository);
container
  .bind<ArticleChunkingService>(TYPES.IArticleChunkingService)
  .to(ArticleChunkingService);
container
  .bind<ArticleSearchService>(TYPES.IArticleSearchService)
  .to(ArticleSearchService)
  .inSingletonScope();

container.bind<ITagRepository>(TYPES.ITagRepository).to(TagRepository);
container.bind<ITagService>(TYPES.ITagService).to(TagService);
container.bind<TagController>(TagController).toSelf();

container
  .bind<IAnnouncementRepository>(TYPES.IAnnouncementRepository)
  .to(AnnouncementRepository);
container.bind<IAnnouncementInboxService>(TYPES.IAnnouncementInboxService).to(AnnouncementInboxService);
container.bind<IAnnouncementManagementService>(TYPES.IAnnouncementManagementService).to(AnnouncementManagementService);
container.bind<IAnnouncementEngagementService>(TYPES.IAnnouncementEngagementService).to(AnnouncementEngagementService);
container.bind<AnnouncementController>(AnnouncementController).toSelf();

container
  .bind<IAnnouncementAcknowledgementRepository>(
    TYPES.IAnnouncementAcknowledgementRepository,
  )
  .to(AnnouncementAcknowledgementRepository);

container
  .bind<IAnnouncementReadRepository>(TYPES.IAnnouncementReadRepository)
  .to(AnnouncementReadRepository);

container
  .bind<ICustomFieldRepository>(TYPES.ICustomFieldRepository)
  .to(CustomFieldRepository);
container
  .bind<ICustomFieldService>(TYPES.ICustomFieldService)
  .to(CustomFieldService);
container.bind<CustomFieldController>(CustomFieldController).toSelf();

container
  .bind<IStaffDirectoryOrderRepository>(TYPES.IStaffDirectoryOrderRepository)
  .to(StaffDirectoryOrderRepository);
container
  .bind<IStaffDirectoryOrderService>(TYPES.IStaffDirectoryOrderService)
  .to(StaffDirectoryOrderService);
container
  .bind<StaffDirectoryOrderController>(StaffDirectoryOrderController)
  .toSelf();

container
  .bind<ExternalValidationService>(TYPES.ExternalValidationService)
  .to(ExternalValidationService);

container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<AuthController>(AuthController).toSelf();

container.bind<ICourseRepository>(TYPES.ICourseRepository).to(CourseRepository);
container.bind<ICourseService>(TYPES.ICourseService).to(CourseService);
container.bind<CourseController>(CourseController).toSelf();
container
  .bind<ICourseUserValueRepository>(TYPES.ICourseUserValueRepository)
  .to(CourseUserValueRepository);

container
  .bind<ITrainingTopicRepository>(TYPES.ITrainingTopicRepository)
  .to(TrainingTopicRepository);
container
  .bind<ITrainingTopicService>(TYPES.ITrainingTopicService)
  .to(TrainingTopicService);
container.bind<TrainingTopicController>(TrainingTopicController).toSelf();
container
  .bind<ITrainingTopicUserValueRepository>(
    TYPES.ITrainingTopicUserValueRepository,
  )
  .to(TrainingTopicUserValueRepository);

container.bind<IClassRepository>(TYPES.IClassRepository).to(ClassRepository);
container.bind<IClassService>(TYPES.IClassService).to(ClassService);
container.bind<ClassController>(ClassController).toSelf();
container
  .bind<IClassUserValueRepository>(TYPES.IClassUserValueRepository)
  .to(ClassUserValueRepository);

container
  .bind<ICommentRepository>(TYPES.ICommentRepository)
  .to(CommentRepository);

container.bind<IExamRepository>(TYPES.IExamRepository).to(ExamRepository);
container.bind<IExamAdminService>(TYPES.IExamAdminService).to(ExamAdminService);
container.bind<IExamStudentService>(TYPES.IExamStudentService).to(ExamStudentService);
container.bind<IExamStandaloneService>(TYPES.IExamStandaloneService).to(ExamStandaloneService);
container.bind<ExamController>(ExamController).toSelf();

container
  .bind<IQuestionRepository>(TYPES.IQuestionRepository)
  .to(QuestionRepository);
container.bind<IQuestionService>(TYPES.IQuestionService).to(QuestionService);
container.bind<QuestionController>(QuestionController).toSelf();

container
  .bind<IQuestionTypeRepository>(TYPES.IQuestionTypeRepository)
  .to(QuestionTypeRepository);
container
  .bind<IQuestionTypeService>(TYPES.IQuestionTypeService)
  .to(QuestionTypeService);
container.bind<QuestionTypeController>(QuestionTypeController).toSelf();

container.bind<IOptionRepository>(TYPES.IOptionRepository).to(OptionRepository);
container.bind<IOptionService>(TYPES.IOptionService).to(OptionService);
container.bind<OptionController>(OptionController).toSelf();

container
  .bind<IUserExamAttemptRepository>(TYPES.IUserExamAttemptRepository)
  .to(UserExamAttemptRepository);
container
  .bind<IUserExamAttemptService>(TYPES.IUserExamAttemptService)
  .to(UserExamAttemptService);
container.bind<UserExamAttemptController>(UserExamAttemptController).toSelf();

container
  .bind<IUserAnswerRepository>(TYPES.IUserAnswerRepository)
  .to(UserAnswerRepository);

export { container };
