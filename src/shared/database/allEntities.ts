import { Announcement } from '../../modules/external/announcements/entity/Announcement.entity';
import { AnnouncementAcknowledgement } from '../../modules/external/announcements/entity/AnnouncementAcknowledgement.entity';
import { AnnouncementRead } from '../../modules/external/announcements/entity/AnnouncementRead.entity';
import { AnnouncementAssignedToUser } from '../../modules/external/announcements/entity/AnnouncementUsers.entity';
import { StaffDirectoryOrder } from '../../modules/external/humanResources/entities/StaffDirectoryOrder.entity';
import { Client } from '../../modules/external/knowledgeBase/entities/Client.entity';
import { Topic } from '../../modules/external/knowledgeBase/entities/Topic.entity';
import { Class } from '../../modules/external/training/entities/Class.entity';
import { ClassUserValue } from '../../modules/external/training/entities/ClassUserValue.entity';
import { Comment } from '../../modules/external/training/entities/Comment.entity';
import { Course } from '../../modules/external/training/entities/Course.entity';
import { CourseUserValue } from '../../modules/external/training/entities/CourseUserValue.entity';
import { Exam } from '../../modules/external/training/entities/Exam.entity';
import { Option } from '../../modules/external/training/entities/Option.entity';
import { Question } from '../../modules/external/training/entities/Question.entity';
import { QuestionType } from '../../modules/external/training/entities/QuestionType.entity';
import { TrainingTopic } from '../../modules/external/training/entities/TrainingTopic.entity';
import { TrainingTopicUserValue } from '../../modules/external/training/entities/TrainingTopicUserValue.entity';
import { UserAnswer } from '../../modules/external/training/entities/UserAnswers.entity';
import { UserExamAttempt } from '../../modules/external/training/entities/UserExamAttempts.entity';
import { Document } from '../../modules/internal/documents/entities/Document.entity';
import { Assignment } from '../../modules/internal/users/entities/Assignment.entity';
import { CustomField } from '../../modules/internal/users/entities/CustomField.entity';
import { Permission } from '../../modules/internal/users/entities/Permission.entity';
import { Role } from '../../modules/internal/users/entities/Role.entity';
import { User } from '../../modules/internal/users/entities/User.entity';
import { UserCustomFieldValue } from '../../modules/internal/users/entities/UserCustomFieldValue.entity';
import { UserDetails } from '../../modules/internal/users/entities/UserDetail.entity';
import { UserReportsTo } from '../../modules/internal/users/entities/UserReportsTo.entity';

export const ALL_ENTITIES = [
  User,
  Announcement,
  AnnouncementAcknowledgement,
  AnnouncementRead,
  AnnouncementAssignedToUser,
  StaffDirectoryOrder,
  Client,
  Topic,
  Class,
  ClassUserValue,
  Comment,
  Course,
  CourseUserValue,
  Exam,
  Option,
  Question,
  QuestionType,
  TrainingTopic,
  TrainingTopicUserValue,
  UserAnswer,
  UserExamAttempt,
  Document,
  Assignment,
  CustomField,
  Permission,
  Role,
  UserCustomFieldValue,
  UserDetails,
  UserReportsTo,
];
