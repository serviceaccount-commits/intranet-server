import { inject, injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IExamRepository } from '../interfaces/exams/exam.repository.interface';
import { IUserRepository } from '../../../internal/users/interfaces/users/user.repository.interface';
import { IQuestionService } from '../interfaces/questions/question.service.interface';
import { IExamStandaloneService } from '../interfaces/exams/exam-standalone.service.interface';
import { Exam } from '../entities/Exam.entity';
import { StandaloneExam } from '../entities/StandaloneExam.entity';
import { ExamWithStandaloneExam } from '../interfaces/exams/exam.service.repository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import ES from '../../../../shared/types/enum/ES';

@injectable()
export class ExamStandaloneService implements IExamStandaloneService {
  constructor(
    @inject(TYPES.IExamRepository) private examRepository: IExamRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IQuestionService) private questionService: IQuestionService,
  ) {}

  async createStandaloneExam(userId: string): Promise<ExamWithStandaloneExam> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) throw new NotFoundError('User', userId);

    const standaloneExam = new StandaloneExam();
    standaloneExam.user = user;
    standaloneExam.user_id = user.user_id;
    standaloneExam.standalone_exam_name = '';
    standaloneExam.standalone_exam_status = ES.IN_PROGRESS;

    const exam = await this.examRepository.createStandaloneExam(standaloneExam);
    const examEntity = new Exam();
    examEntity.exam_id = exam.standalone_exam_id;
    examEntity.exam_title = exam.standalone_exam_name;
    examEntity.exam_status = exam.standalone_exam_status;
    examEntity.version = 1;
    examEntity.max_attempts = 2;
    examEntity.passing_score = 75;
    examEntity.exam_status = ES.DRAFT;
    examEntity.exam_type = ES.STANDALONE_EXAM;
    examEntity.standalone_exam_id = exam.standalone_exam_id;

    const createdExam = await this.examRepository.create(examEntity);
    examEntity.questions = [await this.questionService.createQuestion({ examId: createdExam.exam_id })];

    return { exam: createdExam, standaloneExam: exam };
  }

  async getStandaloneExam(standaloneExamId: string): Promise<Exam | null> {
    return this.examRepository.findDetailedByStandaloneExamId(standaloneExamId);
  }

  async getStandaloneExamMetadata(standaloneExamId: string): Promise<StandaloneExam | null> {
    return this.examRepository.findStandaloneExamById(standaloneExamId);
  }

  async updateStandaloneExamName(standaloneExamId: string, examTitle: string): Promise<void> {
    const exam = await this.examRepository.findStandaloneExamById(standaloneExamId);
    if (!exam) throw new NotFoundError('Exam', standaloneExamId);

    exam.standalone_exam_name = examTitle;
    await this.examRepository.saveStandaloneExam(exam);
  }

  async requestStandaloneExamApproval(standaloneExamId: string): Promise<StandaloneExam> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const standaloneExam = await this.examRepository.findStandaloneExamById(standaloneExamId);
      if (!standaloneExam) throw new NotFoundError('Standalone Exam', standaloneExamId);
      if (standaloneExam.standalone_exam_status !== ES.IN_PROGRESS) {
        throw new BusinessLogicError('Standalone Exam is not in progress');
      }

      standaloneExam.standalone_exam_status = ES.AWAITING_APPROVAL;
      standaloneExam.awaiting_approval_at = new Date();
      return this.examRepository.saveStandaloneExam(standaloneExam);
    });
  }

  async approveStandaloneExam(standaloneExamId: string): Promise<StandaloneExam> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const standaloneExam = await this.examRepository.findStandaloneExamById(standaloneExamId);
      if (!standaloneExam) throw new NotFoundError('Standalone Exam', standaloneExamId);
      if (standaloneExam.standalone_exam_status !== ES.AWAITING_APPROVAL) {
        throw new BusinessLogicError('Standalone Exam is not awaiting approval');
      }

      standaloneExam.standalone_exam_status = ES.APPROVED;
      standaloneExam.approved_at = new Date();
      return this.examRepository.saveStandaloneExam(standaloneExam);
    });
  }

  async getStandaloneExamsWaitingForApproval(): Promise<StandaloneExam[]> {
    return this.examRepository.findAllStandaloneExamsWaitingForApproval();
  }

  async getMyStandaloneExams(userId: string): Promise<StandaloneExam[]> {
    return this.examRepository.findAllStandaloneExamsByUserId(userId);
  }
}
