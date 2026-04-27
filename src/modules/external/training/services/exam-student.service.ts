import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IExamRepository } from '../interfaces/exams/exam.repository.interface';
import { IClassRepository } from '../interfaces/classes/class.repository.interface';
import { IClassUserValueRepository } from '../interfaces/classes/classUserValue.repository.interface';
import { IUserExamAttemptRepository } from '../interfaces/userExamAttempts/userExamAttempt.repository.interface';
import { IExamStudentService } from '../interfaces/exams/exam-student.service.interface';
import { Exam } from '../entities/Exam.entity';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import ES from '../../../../shared/types/enum/ES';
import { UserFacingExam } from '../types/Training.types';

@injectable()
export class ExamStudentService implements IExamStudentService {
  constructor(
    @inject(TYPES.IExamRepository) private examRepository: IExamRepository,
    @inject(TYPES.IClassRepository) private classRepository: IClassRepository,
    @inject(TYPES.IClassUserValueRepository)
    private classUserValueRepository: IClassUserValueRepository,
    @inject(TYPES.IUserExamAttemptRepository)
    private userExamAttemptRepository: IUserExamAttemptRepository,
  ) {}

  private async getLatestExamVersion(classId: string): Promise<Exam | null> {
    const exams = await this.examRepository.findAllByClassId(classId);
    if (!exams || exams.length === 0) return null;

    const latestVersion = Math.max(...exams.map((exam) => exam.version));
    return exams.find((exam) => exam.version === latestVersion) ?? null;
  }

  async getUserExam(classId: string, userId: string): Promise<UserFacingExam | void> {
    const examClass = await this.classRepository.findById(classId);
    if (!examClass) throw new NotFoundError('Class', classId);
    if (examClass.exams.length === 0) return;

    const classUserValue = await this.classUserValueRepository.findByClassIdAndUserId(classId, userId);
    if (!classUserValue) throw new NotFoundError('Class User Value', classId);

    const userExamAttempts = await this.userExamAttemptRepository.findByUserIdAndClassId(
      userId,
      examClass.class_id,
    );

    let validAttemptsCount = 0;
    for (const attempt of userExamAttempts) {
      if (attempt.isValid) validAttemptsCount++;
    }

    if (classUserValue.completion_status === ES.COMPLETED && validAttemptsCount === 0) {
      return;
    }

    const exam = await this.getLatestExamVersion(classId);
    if (!exam) throw new NotFoundError('Exam', classId);
    if (!exam.questions) throw new NotFoundError('Questions', classId);
    if (validAttemptsCount >= exam.max_attempts && exam.max_attempts !== 0) {
      throw new BusinessLogicError('You have reached the maximum attempts');
    }

    return {
      exam_id: exam.exam_id,
      exam_title: exam.exam_title,
      passing_score: exam.passing_score,
      max_attempts: exam.max_attempts,
      version: exam.version,
      questions: exam.questions.map((question) => {
        if (!question.options) throw new NotFoundError('Options', classId);
        return {
          question_id: question.question_id,
          question_text: question.question_text,
          options: question.options.map((option) => ({
            option_id: option.option_id,
            option_text: option.option_text,
          })),
          question_type: question.question_type,
        };
      }),
      exam_status: exam.exam_status as ES.PUBLISHED | ES.DRAFT | ES.OUTDATED,
    };
  }

  async getUserExamNoAttemptLimit(classId: string, userId: string): Promise<UserFacingExam | void> {
    const examClass = await this.classRepository.findById(classId);
    if (!examClass) throw new NotFoundError('Class', classId);
    if (examClass.exams.length === 0) return;

    const classUserValue = await this.classUserValueRepository.findByClassIdAndUserId(classId, userId);
    if (!classUserValue) throw new NotFoundError('Class User Value', classId);

    const userExamAttempts = await this.userExamAttemptRepository.findByUserIdAndClassId(
      userId,
      examClass.class_id,
    );

    if (classUserValue.completion_status === ES.COMPLETED && userExamAttempts.length === 0) {
      return;
    }

    const exam = await this.getLatestExamVersion(classId);
    if (!exam) throw new NotFoundError('Exam', classId);
    if (!exam.questions) throw new NotFoundError('Questions', classId);

    return {
      exam_id: exam.exam_id,
      exam_title: exam.exam_title,
      passing_score: exam.passing_score,
      max_attempts: exam.max_attempts,
      version: exam.version,
      questions: exam.questions.map((question) => {
        if (!question.options) throw new NotFoundError('Options', classId);
        return {
          question_id: question.question_id,
          question_text: question.question_text,
          options: question.options.map((option) => ({
            option_id: option.option_id,
            option_text: option.option_text,
          })),
          question_type: question.question_type,
        };
      }),
      exam_status: exam.exam_status as ES.PUBLISHED | ES.DRAFT | ES.OUTDATED,
    };
  }

  async getUserExamStatus(
    classId: string,
    userId: string,
  ): Promise<ES.PASSED | ES.FAILED | ES.CAN_RETAKE | ES.NOT_ATTEMPTED | ES.NO_EXAM> {
    const examClass = await this.classRepository.findById(classId);
    if (!examClass) throw new NotFoundError('Class', classId);
    if (examClass.exams.length === 0) return ES.NO_EXAM;

    const classUserValue = await this.classUserValueRepository.findByClassIdAndUserId(classId, userId);
    if (!classUserValue) throw new NotFoundError('Class User Value', classId);

    const userExamAttempts = await this.userExamAttemptRepository.findByUserIdAndClassId(
      userId,
      examClass.class_id,
    );

    const userExam = await this.getUserExamNoAttemptLimit(classId, userId);
    if (!userExam) return ES.NO_EXAM;

    const hasPassed = userExamAttempts.some((attempt) => attempt.score >= attempt.exam.passing_score);
    const validAttempts = userExamAttempts.filter((attempt) => attempt.isValid);
    const exam = userExamAttempts[0]?.exam;

    if (!exam) return ES.NOT_ATTEMPTED;
    if (userExamAttempts.length === 0) return ES.NOT_ATTEMPTED;
    if (userExamAttempts.length > 0 && hasPassed) return ES.PASSED;
    if (userExamAttempts.length > 0 && !hasPassed && validAttempts.length < exam.max_attempts) return ES.CAN_RETAKE;
    if (userExamAttempts.length > 0 && !hasPassed && validAttempts.length >= exam.max_attempts) return ES.FAILED;

    return ES.NO_EXAM;
  }
}
