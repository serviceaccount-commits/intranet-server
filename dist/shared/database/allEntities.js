"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_ENTITIES = void 0;
const Announcement_entity_1 = require("../../modules/external/announcements/entity/Announcement.entity");
const AnnouncementAcknowledgement_entity_1 = require("../../modules/external/announcements/entity/AnnouncementAcknowledgement.entity");
const AnnouncementRead_entity_1 = require("../../modules/external/announcements/entity/AnnouncementRead.entity");
const AnnouncementUsers_entity_1 = require("../../modules/external/announcements/entity/AnnouncementUsers.entity");
const StaffDirectoryOrder_entity_1 = require("../../modules/external/humanResources/entities/StaffDirectoryOrder.entity");
const Client_entity_1 = require("../../modules/external/knowledgeBase/entities/Client.entity");
const Topic_entity_1 = require("../../modules/external/knowledgeBase/entities/Topic.entity");
const Class_entity_1 = require("../../modules/external/training/entities/Class.entity");
const ClassUserValue_entity_1 = require("../../modules/external/training/entities/ClassUserValue.entity");
const Comment_entity_1 = require("../../modules/external/training/entities/Comment.entity");
const Course_entity_1 = require("../../modules/external/training/entities/Course.entity");
const CourseUserValue_entity_1 = require("../../modules/external/training/entities/CourseUserValue.entity");
const Exam_entity_1 = require("../../modules/external/training/entities/Exam.entity");
const Option_entity_1 = require("../../modules/external/training/entities/Option.entity");
const Question_entity_1 = require("../../modules/external/training/entities/Question.entity");
const QuestionType_entity_1 = require("../../modules/external/training/entities/QuestionType.entity");
const TrainingTopic_entity_1 = require("../../modules/external/training/entities/TrainingTopic.entity");
const TrainingTopicUserValue_entity_1 = require("../../modules/external/training/entities/TrainingTopicUserValue.entity");
const UserAnswers_entity_1 = require("../../modules/external/training/entities/UserAnswers.entity");
const StandaloneExam_entity_1 = require("../../modules/external/training/entities/StandaloneExam.entity");
const UserExamAttempts_entity_1 = require("../../modules/external/training/entities/UserExamAttempts.entity");
const Document_entity_1 = require("../../modules/internal/documents/entities/Document.entity");
const Assignment_entity_1 = require("../../modules/internal/users/entities/Assignment.entity");
const CustomField_entity_1 = require("../../modules/internal/users/entities/CustomField.entity");
const Permission_entity_1 = require("../../modules/internal/users/entities/Permission.entity");
const Role_entity_1 = require("../../modules/internal/users/entities/Role.entity");
const User_entity_1 = require("../../modules/internal/users/entities/User.entity");
const UserCustomFieldValue_entity_1 = require("../../modules/internal/users/entities/UserCustomFieldValue.entity");
const UserDetail_entity_1 = require("../../modules/internal/users/entities/UserDetail.entity");
const UserReportsTo_entity_1 = require("../../modules/internal/users/entities/UserReportsTo.entity");
exports.ALL_ENTITIES = [
    User_entity_1.User,
    Announcement_entity_1.Announcement,
    AnnouncementAcknowledgement_entity_1.AnnouncementAcknowledgement,
    AnnouncementRead_entity_1.AnnouncementRead,
    AnnouncementUsers_entity_1.AnnouncementAssignedToUser,
    StaffDirectoryOrder_entity_1.StaffDirectoryOrder,
    Client_entity_1.Client,
    Topic_entity_1.Topic,
    Class_entity_1.Class,
    ClassUserValue_entity_1.ClassUserValue,
    Comment_entity_1.Comment,
    Course_entity_1.Course,
    CourseUserValue_entity_1.CourseUserValue,
    Exam_entity_1.Exam,
    Option_entity_1.Option,
    Question_entity_1.Question,
    QuestionType_entity_1.QuestionType,
    TrainingTopic_entity_1.TrainingTopic,
    TrainingTopicUserValue_entity_1.TrainingTopicUserValue,
    UserAnswers_entity_1.UserAnswer,
    StandaloneExam_entity_1.StandaloneExam,
    UserExamAttempts_entity_1.UserExamAttempt,
    Document_entity_1.Document,
    Assignment_entity_1.Assignment,
    CustomField_entity_1.CustomField,
    Permission_entity_1.Permission,
    Role_entity_1.Role,
    UserCustomFieldValue_entity_1.UserCustomFieldValue,
    UserDetail_entity_1.UserDetails,
    UserReportsTo_entity_1.UserReportsTo,
];
//# sourceMappingURL=allEntities.js.map