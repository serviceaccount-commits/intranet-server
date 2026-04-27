import { Exam } from '../../entities/Exam.entity';
import { CreateExamInput } from '../../schema/exams/CreateExamSchema';
import { UpdateExamInput } from '../../schema/exams/UpdateExamSchema';
import {
  ExamMetadata,
  UserExamAttemptDashboardResult,
  UserExamMetadata,
} from '../../types/Training.types';

export interface IExamAdminService {
  createExam(input: CreateExamInput): Promise<Exam>;
  updateExam(examId: string, input: UpdateExamInput): Promise<Exam>;
  deleteExam(examId: string): Promise<void>;
  getLatestExamVersion(classId: string): Promise<Exam | null>;
  getAdminExam(examId: string): Promise<Exam | null>;
  getAllClassExams(classId: string): Promise<Exam[]>;
  getAllClassExamsMetadataOnly(classId: string): Promise<ExamMetadata[]>;
  getExamsDashboard(): Promise<UserExamMetadata[]>;
  getUserExamAttempts(userId: string, examId: string): Promise<UserExamAttemptDashboardResult[]>;
}
