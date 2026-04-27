import { inject, injectable } from 'inversify';
import { IClassService } from '../interfaces/classes/class.service.interface';
import { IClassRepository } from '../interfaces/classes/class.repository.interface';
import { TYPES } from '../../../../shared/config/containerTypes';
import { ICourseRepository } from '../interfaces/courses/course.repository.interface';
import { Class } from '../entities/Class.entity';
import {
  CreateClassInput,
  CreateClassSchema,
} from '../schema/classes/CreateClassSchema';
import { AppDataSource } from '../../../../shared/database/data-source';
import { ITrainingTopicRepository } from '../interfaces/trainingTopics/trainingTopic.repository.interface';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
// import { ConflictError } from '../../../../shared/errors/ConflictError';
import {
  UpdateClassInput,
  UpdateClassSchema,
} from '../schema/classes/UpdateClassSchema';
import {
  CreateCommentInput,
  CreateCommentSchema,
} from '../schema/comments/CreateCommentSchema';
import { Comment } from '../entities/Comment.entity';
import {
  UpdateCommentInput,
  UpdateCommentSchema,
} from '../schema/comments/UpdateCommentSchema';
import { IUserRepository } from '../../../internal/users/interfaces/users/user.repository.interface';
import { ICommentRepository } from '../interfaces/comments/comment.repository.interface';
import { ITrainingTopicUserValueRepository } from '../interfaces/trainingTopics/trainingTopicUserValue.repository.interface';
import { IClassUserValueRepository } from '../interfaces/classes/classUserValue.repository.interface';
import ES from '../../../../shared/types/enum/ES';
import { IDocumentService } from '../../../internal/documents/interfaces/documents.service.interface';
import { ClassUserValue } from '../entities/ClassUserValue.entity';
import { Document } from '../../../internal/documents/entities/Document.entity';
import {
  ClassWithContent,
  ClassWithContentAndUserValueAndUserExamStatus,
} from '../types/Training.types';
import { IExamAdminService } from '../interfaces/exams/exam-admin.service.interface';
import { IExamStudentService } from '../interfaces/exams/exam-student.service.interface';
import { Exam } from '../entities/Exam.entity';
import { IExamRepository } from '../interfaces/exams/exam.repository.interface';

@injectable()
export class ClassService implements IClassService {
  constructor(
    @inject(TYPES.IClassRepository) private classRepository: IClassRepository,
    @inject(TYPES.ICourseRepository)
    private courseRepository: ICourseRepository,
    @inject(TYPES.IUserRepository)
    private userRepository: IUserRepository,
    @inject(TYPES.ITrainingTopicRepository)
    private trainingTopicRepository: ITrainingTopicRepository,
    @inject(TYPES.ICommentRepository)
    private commentRepository: ICommentRepository,
    @inject(TYPES.ITrainingTopicUserValueRepository)
    private trainingTopicUserValueRepository: ITrainingTopicUserValueRepository,
    @inject(TYPES.IClassUserValueRepository)
    private classUserValueRepository: IClassUserValueRepository,
    @inject(TYPES.IDocumentService) private documentService: IDocumentService,
    @inject(TYPES.IExamAdminService) private examAdminService: IExamAdminService,
    @inject(TYPES.IExamStudentService) private examStudentService: IExamStudentService,
    @inject(TYPES.IExamRepository) private examRepository: IExamRepository,
  ) {}

  async createClass(input: CreateClassInput): Promise<Class> {
    const validatedData = CreateClassSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      const existingTrainingTopic = await this.trainingTopicRepository.findById(
        validatedData.topicId,
      );
      if (!existingTrainingTopic) {
        throw new NotFoundError('Training topic', validatedData.topicId);
      }

      const course = await this.courseRepository.findById(
        existingTrainingTopic.course_id,
      );
      if (course) {
        course.updated_at = new Date();
        await this.courseRepository.save(course);
      }

      const existingUser = await this.userRepository.findUserById(
        validatedData.userId,
      );
      if (!existingUser) {
        throw new NotFoundError('User', validatedData.userId);
      }

      // const existingClass = await this.classRepository.findByName(
      //   validatedData.className,
      // );
      // if (existingClass) {
      //   throw new ConflictError(
      //     `Class with name ${validatedData.className} already exists.`,
      //   );
      // }

      const document: Document = await this.documentService.createClassDocument(
        validatedData.content,
      );

      const newClass = new Class();
      newClass.class_name = validatedData.className;
      newClass.class_description = validatedData.classDescription;
      newClass.private_comments = validatedData.privateComments;
      newClass.user = existingUser;
      newClass.user_id = validatedData.userId;
      newClass.topic = existingTrainingTopic;
      newClass.topic_id = validatedData.topicId;
      newClass.class_status = ES.PUBLISHED;
      newClass.document = document;
      newClass.document_id = document.document_id;

      const classEntity = await this.classRepository.create(newClass);

      const trainingTopicUserValues =
        await this.trainingTopicUserValueRepository.findByTopicId(
          validatedData.topicId,
          false,
        );

      const newClassUserValues: ClassUserValue[] = [];
      for (const topicUserValue of trainingTopicUserValues) {
        const newClassUserValue = new ClassUserValue();
        newClassUserValue.user = topicUserValue.user;
        newClassUserValue.user_id = topicUserValue.user_id;
        newClassUserValue.class = classEntity;
        newClassUserValue.class_id = classEntity.class_id;
        newClassUserValue.topicValue = topicUserValue;
        newClassUserValue.topic_value_id = topicUserValue.topic_value_id;
        newClassUserValue.completion_status = ES.INCOMPLETE;
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

  async updateClass(classId: string, input: UpdateClassInput): Promise<Class> {
    const validatedData = UpdateClassSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      const existingClass = await this.classRepository.findById(classId);
      if (!existingClass) {
        throw new NotFoundError('Class', classId);
      }

      const course = await this.courseRepository.findById(
        existingClass.topic.course_id,
      );
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
        const trainingTopicUserValues =
          await this.trainingTopicUserValueRepository.findByTopicId(
            existingClass.topic_id,
            false,
          );
        let countChange = 0;
        if (classStatus === ES.DRAFT && newStatus === ES.PUBLISHED) {
          countChange = 1;
        } else if (classStatus === ES.DRAFT && newStatus === ES.ARCHIVED) {
          countChange = 0;
        } else if (classStatus === ES.PUBLISHED && newStatus === ES.DRAFT) {
          countChange = -1;
        } else if (classStatus === ES.PUBLISHED && newStatus === ES.ARCHIVED)
          countChange = -1;
        else if (classStatus === ES.ARCHIVED && newStatus === ES.PUBLISHED)
          countChange = 1;
        else if (classStatus === ES.ARCHIVED && newStatus === ES.DRAFT)
          countChange = 0;

        if (countChange !== 0 && trainingTopicUserValues.length > 0) {
          for (const topicUserValue of trainingTopicUserValues) {
            topicUserValue.total_classes_count += countChange;

            if (topicUserValue.total_classes_count < 0) {
              topicUserValue.total_classes_count = 0;
            }
          }
          await this.trainingTopicUserValueRepository.saveMany(
            trainingTopicUserValues,
          );
        }
      }

      // await this.documentService.updateLocalDocument(
      //   existingClass.document_id,
      //   'classes',
      //   validatedData.content,
      // );

      await this.documentService.uploadDocumentToS3(
        existingClass.document_id,
        'classes',
        validatedData.content,
      );

      // IF NAME CHANGED UPDATE ALL EXAMS UNDER THIS CLASS TO GET THE NAME TO "Exam For ${newClassName}"
      if (nameChanged) {
        const allExams = await this.examAdminService.getAllClassExams(classId);
        let examsToSave: Exam[] = [];
        for (const exam of allExams) {
          exam.exam_title = `Exam for ${validatedData.className}`;
          examsToSave.push(exam);
        }
        await this.examRepository.saveMany(examsToSave);
      }

      return await this.classRepository.save(existingClass);
    });
  }

  async updateClassUserValue(
    classId: string,
    userId: string,
    completionStatus: ES.COMPLETED | ES.INCOMPLETE,
  ): Promise<void> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const classUserValue =
        await this.classUserValueRepository.findByClassIdAndUserId(
          classId,
          userId,
        );

      if (!classUserValue) {
        throw new NotFoundError('ClassUserValue', classId);
      }

      const trainingTopicUserValue = classUserValue.topicValue;
      const originalStatus = classUserValue.completion_status;

      if (originalStatus === completionStatus) {
        return;
      }

      if (classUserValue.completion_status === completionStatus) {
        return;
      }
      if (
        classUserValue.completion_status === ES.COMPLETED &&
        completionStatus === ES.INCOMPLETE &&
        trainingTopicUserValue.total_classes_count > 0
      ) {
        trainingTopicUserValue.completed_classes_count -= 1;
      } else if (
        classUserValue.completion_status === ES.INCOMPLETE &&
        completionStatus === ES.COMPLETED
      ) {
        trainingTopicUserValue.completed_classes_count += 1;
      }

      classUserValue.completion_status = completionStatus;

      await this.trainingTopicUserValueRepository.save(trainingTopicUserValue);
      await this.classUserValueRepository.save(classUserValue);
    });
  }

  async getClasses(topicId: string): Promise<Class[]> {
    return await this.classRepository.findByTopicId(topicId);
  }

  async getClassById(classId: string): Promise<ClassWithContent> {
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new NotFoundError('Class', classId);
    }

    // const fileContent = await this.documentService.getLocalDocument(
    //   classEntity.document_id,
    //   'classes',
    // );
    const fileContent = await this.documentService.getDocumentFromS3(
      classEntity.document_id,
      'classes',
    );

    return { class: classEntity, content: fileContent };
  }

  async getClassByIdWithUserValueAndExam(
    classId: string,
    userId: string,
  ): Promise<ClassWithContentAndUserValueAndUserExamStatus> {
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new NotFoundError('Class', classId);
    }

    const userValue =
      await this.classUserValueRepository.findByClassIdAndUserId(
        classId,
        userId,
      );
    if (!userValue) {
      0;
      throw new NotFoundError('Class User Value', classId);
    }


    // const fileContent = await this.documentService.getLocalDocument(
    //   classEntity.document_id,
    //   'classes',
    // );
    const fileContent = await this.documentService.getDocumentFromS3(
      classEntity.document_id,
      'classes',
    );

    return {
      classData: {
        class: classEntity,
        content: fileContent,
        userValue: userValue,
      },
      userExamStatus: await this.examStudentService.getUserExamStatus(classId, userId),
    };
  }

  async addCommentToClass(
    classId: string,
    input: CreateCommentInput,
  ): Promise<void> {
    const validatedData = CreateCommentSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      const trainingClass = await this.classRepository.findById(classId);
      if (!trainingClass) {
        throw new NotFoundError('Class', classId);
      }

      const user = await this.userRepository.findUserById(validatedData.userId);
      if (!user) {
        throw new NotFoundError('User', validatedData.userId);
      }

      const newComment = new Comment();
      newComment.comment_content = validatedData.commentContent;
      newComment.comment_status = validatedData.commentStatus;
      newComment.user = user;
      newComment.user_id = validatedData.userId;

      trainingClass.comments = [...(trainingClass.comments || []), newComment];

      await this.commentRepository.create(newComment);

      await this.classRepository.save(trainingClass);
    });
  }

  async updateComment(
    commentId: string,
    input: UpdateCommentInput,
  ): Promise<void> {
    const validatedData = UpdateCommentSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      const comment = await this.commentRepository.findById(commentId);
      if (!comment) {
        throw new NotFoundError('Comment', commentId);
      }

      comment.comment_content = validatedData.commentContent;
      comment.comment_status = validatedData.commentStatus;

      await this.commentRepository.save(comment);
    });
  }

  async getClassActiveComments(classId: string): Promise<Comment[]> {
    return await this.commentRepository.findActiveByClassId(classId);
  }

  async getCommentById(commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment', commentId);
    }
    return comment;
  }

  async getComments(classId: string): Promise<Comment[]> {
    return await this.commentRepository.findAll(classId);
  }
}
