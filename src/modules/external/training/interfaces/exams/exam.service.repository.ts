import ES from '../../../../../shared/types/enum/ES';
import { Exam } from '../../entities/Exam.entity';
import { StandaloneExam } from '../../entities/StandaloneExam.entity';
import { CreateExamInput } from '../../schema/exams/CreateExamSchema';
import { UpdateExamInput } from '../../schema/exams/UpdateExamSchema';
import {
  ExamMetadata,
  UserExamAttemptDashboardResult,
  UserExamMetadata,
  UserExamWithAnswers,
  UserFacingExam,
} from '../../types/Training.types';

export interface ExamWithStandaloneExam {
  exam: Exam;
  standaloneExam: StandaloneExam;
}

export interface IExamService {
  createExam(input: CreateExamInput): Promise<Exam>;
  updateExam(examId: string, input: UpdateExamInput): Promise<Exam>;
  deleteExam(examId: string): Promise<void>;
  getLatestExamVersion(classId: string): Promise<Exam | null>;
  getAdminExam(examId: string): Promise<Exam | null>;
  getAllClassExams(classId: string): Promise<Exam[]>;
  getAllClassExamsMetadataOnly(classId: string): Promise<ExamMetadata[]>;
  getUserExam(
    classId: string,
    userId: string,
  ): Promise<UserFacingExam | UserExamWithAnswers | void>;
  getUserExamNoAttemptLimit(
    classId: string,
    userId: string,
  ): Promise<UserFacingExam | void>;

  createStandaloneExam(userId: string): Promise<ExamWithStandaloneExam>;
  getStandaloneExam(standaloneExamId: string): Promise<Exam | null>;
  updateStandaloneExamName(
    standaloneExamId: string,
    examTitle: string,
  ): Promise<void>;

  getUserExamStatus(
    classId: string,
    userId: string,
  ): Promise<
    ES.PASSED | ES.FAILED | ES.CAN_RETAKE | ES.NOT_ATTEMPTED | ES.NO_EXAM
  >;
  getExamsDashboard(): Promise<UserExamMetadata[]>;
  getUserExamAttempts(
    userId: string,
    examId: string,
  ): Promise<UserExamAttemptDashboardResult[]>;
  // publishExam(examId: string): Promise<Exam>;
  getStandaloneExamsWaitingForApproval(): Promise<StandaloneExam[]>;
  getMyStandaloneExams(userId: string): Promise<StandaloneExam[]>;
  requestStandaloneExamApproval(
    standaloneExamId: string,
  ): Promise<StandaloneExam>;
  approveStandaloneExam(standaloneExamId: string): Promise<StandaloneExam>;
  getStandaloneExamMetadata(
    standaloneExamId: string,
  ): Promise<StandaloneExam | null>;
}
