import { inject, injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IClassRepository } from '../interfaces/classes/class.repository.interface';
import { IExamRepository } from '../interfaces/exams/exam.repository.interface';
import { IQuestionService } from '../interfaces/questions/question.service.interface';
import { IUserExamAttemptRepository } from '../interfaces/userExamAttempts/userExamAttempt.repository.interface';
import { IExamAdminService } from '../interfaces/exams/exam-admin.service.interface';
import { Exam } from '../entities/Exam.entity';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import ES from '../../../../shared/types/enum/ES';
import {
  CreateExamInput,
  CreateExamSchema,
} from '../schema/exams/CreateExamSchema';
import {
  UpdateExamInput,
  UpdateExamSchema,
} from '../schema/exams/UpdateExamSchema';
import {
  ExamMetadata,
  UserExamAttemptDashboardResult,
  UserExamMetadata,
} from '../types/Training.types';

@injectable()
export class ExamAdminService implements IExamAdminService {
  constructor(
    @inject(TYPES.IExamRepository) private examRepository: IExamRepository,
    @inject(TYPES.IUserExamAttemptRepository)
    private userExamAttemptRepository: IUserExamAttemptRepository,
    @inject(TYPES.IClassRepository) private classRepository: IClassRepository,
    @inject(TYPES.IQuestionService) private questionService: IQuestionService,
  ) {}

  async createExam(input: CreateExamInput): Promise<Exam> {
    const validatedData = CreateExamSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      const examClass = await this.classRepository.findById(validatedData.classId);
      if (!examClass) throw new NotFoundError('Class', validatedData.classId);

      const existingExams = await this.examRepository.findAllByClassId(examClass.class_id);

      let newExamVersion = 0;

      if (existingExams.length > 0) {
        const latestVersion = Math.max(...existingExams.map((exam) => exam.version));
        const latestExam = existingExams.find((exam) => exam.version === latestVersion);
        newExamVersion = latestVersion + 1;

        if (validatedData.referenceExamId) {
          const referenceExam = existingExams.find(
            (exam) => exam.exam_id === validatedData.referenceExamId,
          );
          if (!referenceExam) throw new NotFoundError('Reference Exam', validatedData.referenceExamId);
          if (referenceExam.exam_status === ES.DRAFT) throw new BusinessLogicError('Reference Exam is not published');
          if (!latestExam) throw new Error('Latest Exam not found');
          if (latestExam.exam_status !== ES.PUBLISHED) throw new BusinessLogicError('Latest Exam is not published');

          const newExam = new Exam();
          newExam.class = examClass;
          newExam.class_id = examClass.class_id;
          newExam.exam_title = 'Exam for ' + examClass.class_name;
          newExam.passing_score = referenceExam.passing_score;
          newExam.version = newExamVersion;
          newExam.exam_status = ES.DRAFT;
          newExam.max_attempts = referenceExam.max_attempts;
          const exam = await this.examRepository.create(newExam);

          await this.questionService.replicateQuestionsFromExamIdToExamId(
            referenceExam.exam_id,
            exam.exam_id,
          );

          const returnExam = await this.getAdminExam(exam.exam_id);
          return returnExam ?? exam;
        } else {
          if (!latestExam) throw new Error('Latest Exam not found');
          if (latestExam.exam_status !== ES.PUBLISHED) throw new BusinessLogicError('Latest Exam is not published');

          const newExam = new Exam();
          newExam.class = examClass;
          newExam.class_id = examClass.class_id;
          newExam.exam_title = 'Exam for ' + examClass.class_name;
          newExam.passing_score = 75;
          newExam.version = newExamVersion;
          newExam.exam_status = ES.DRAFT;
          newExam.max_attempts = 2;
          const exam = await this.examRepository.create(newExam);
          newExam.questions = [await this.questionService.createQuestion({ examId: exam.exam_id })];
          return exam;
        }
      } else {
        newExamVersion = 1;
      }

      const newExam = new Exam();
      newExam.class = examClass;
      newExam.class_id = examClass.class_id;
      newExam.exam_title = `Exam for ${examClass.class_name}`;
      newExam.passing_score = 75;
      newExam.version = newExamVersion;
      newExam.exam_status = ES.DRAFT;
      newExam.max_attempts = 2;
      const exam = await this.examRepository.create(newExam);
      newExam.questions = [await this.questionService.createQuestion({ examId: exam.exam_id })];
      return exam;
    });
  }

  async updateExam(examId: string, input: UpdateExamInput): Promise<Exam> {
    const validatedData = UpdateExamSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      const exam = await this.examRepository.findById(examId, false);
      if (!exam) throw new NotFoundError('Exam', examId);
      if (exam.exam_status !== ES.DRAFT) throw new BusinessLogicError('Exam is not in draft status');

      exam.passing_score = validatedData.passingScore;
      exam.max_attempts = validatedData.maxAttempts;

      const existingExams = await this.examRepository.findAllByClassId(exam.class_id);

      if (existingExams.length >= 2) {
        let prevExam: Exam | null = null;
        const latestVersion = Math.max(...existingExams.map((exam) => exam.version));
        for (const exam of existingExams) {
          if (exam.version === latestVersion - 1) {
            if (exam.exam_status !== ES.PUBLISHED) {
              throw new BusinessLogicError(
                `Prev exam version ${latestVersion - 1} is not published. Please publish it before publishing the new version.`,
              );
            }
            prevExam = exam;
          }
        }
        if (prevExam) {
          prevExam.exam_status = ES.OUTDATED;
          await this.examRepository.save(prevExam);
        }
      }

      if (validatedData.examStatus === ES.PUBLISHED && exam.exam_status === ES.DRAFT) {
        exam.exam_status = ES.PUBLISHED;
      }

      return await this.examRepository.save(exam);
    });
  }

  async deleteExam(examId: string): Promise<void> {
    await AppDataSource.manager.transaction(async (_t) => {
      const exam = await this.examRepository.findById(examId, true);
      if (!exam) throw new NotFoundError('Exam', examId);
      if (exam.exam_status !== ES.DRAFT) throw new BusinessLogicError('Exam is not in draft status');

      await this.questionService.deleteAllQuestionsFromExam(examId);
      await this.examRepository.delete(examId);
    });
  }

  async getLatestExamVersion(classId: string): Promise<Exam | null> {
    const exams = await this.examRepository.findAllByClassId(classId);
    if (!exams || exams.length === 0) return null;

    const latestVersion = Math.max(...exams.map((exam) => exam.version));
    return exams.find((exam) => exam.version === latestVersion) ?? null;
  }

  async getAdminExam(examId: string): Promise<Exam | null> {
    return this.examRepository.findDetailedByExamId(examId);
  }

  async getAllClassExams(classId: string): Promise<Exam[]> {
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) throw new NotFoundError('Class', classId);

    const exams = await this.examRepository.findAllByClassId(classId);
    if (!exams) throw new NotFoundError('Exams', classId);
    return exams;
  }

  async getAllClassExamsMetadataOnly(classId: string): Promise<ExamMetadata[]> {
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) throw new NotFoundError('Class', classId);

    const exams = await this.examRepository.findAllPlainByClassId(classId);
    if (!exams) throw new NotFoundError('Exams', classId);

    return exams.map((exam) => ({
      exam_id: exam.exam_id,
      exam_title: exam.exam_title,
      version: exam.version,
      exam_status: exam.exam_status as ES.PUBLISHED | ES.DRAFT | ES.OUTDATED,
      created_at: exam.created_at,
    }));
  }

  async getExamsDashboard(): Promise<UserExamMetadata[]> {
    const userExamAttempts = await this.userExamAttemptRepository.findAllActive();

    const grouper: Map<string, UserExamAttemptDashboardResult[]> = new Map();

    for (const attempt of userExamAttempts) {
      const key = `${attempt.user_id}-${attempt.exam_id}`;
      if (!grouper.has(key)) {
        grouper.set(key, [attempt]);
      } else {
        grouper.get(key)!.push(attempt);
      }
    }

    const result: UserExamMetadata[] = [];

    for (const [_key, value] of grouper) {
      if (!value[0]) continue;
      let finalAttempt: UserExamMetadata = {
        user_id: value[0].user_id,
        first_name: value[0].first_name,
        last_name: value[0].last_name,
        course_name: value[0].course_name,
        topic_name: value[0].topic_name,
        class_id: value[0].class_id,
        class_name: value[0].class_name,
        status: value[0].status,
        score: value[0].score,
        exam_id: value[0].exam_id,
        user_valid_attempts_count: value.length,
        exam_max_attempts: value[0].exam_max_attempts,
        exam_version: value[0].exam_version,
        attempt_date: value[0].attempt_date,
      };

      for (const attempt of value) {
        if (finalAttempt.attempt_date < attempt.attempt_date) {
          finalAttempt = {
            user_id: attempt.user_id,
            first_name: attempt.first_name,
            last_name: attempt.last_name,
            course_name: attempt.course_name,
            topic_name: attempt.topic_name,
            class_id: attempt.class_id,
            class_name: attempt.class_name,
            status: attempt.status,
            score: attempt.score,
            exam_id: attempt.exam_id,
            user_valid_attempts_count: value.length,
            exam_max_attempts: attempt.exam_max_attempts,
            exam_version: attempt.exam_version,
            attempt_date: attempt.attempt_date,
          };
        }
      }
      result.push(finalAttempt);
    }

    return result;
  }

  async getUserExamAttempts(
    userId: string,
    examId: string,
  ): Promise<UserExamAttemptDashboardResult[]> {
    return this.userExamAttemptRepository.findAllActiveByUserIdAndExamId(userId, examId);
  }
}
