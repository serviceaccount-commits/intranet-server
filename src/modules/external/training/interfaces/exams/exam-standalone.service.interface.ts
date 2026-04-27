import { Exam } from '../../entities/Exam.entity';
import { StandaloneExam } from '../../entities/StandaloneExam.entity';
import { ExamWithStandaloneExam } from './exam.service.repository';

export interface IExamStandaloneService {
  createStandaloneExam(userId: string): Promise<ExamWithStandaloneExam>;
  getStandaloneExam(standaloneExamId: string): Promise<Exam | null>;
  getStandaloneExamMetadata(standaloneExamId: string): Promise<StandaloneExam | null>;
  updateStandaloneExamName(standaloneExamId: string, examTitle: string): Promise<void>;
  requestStandaloneExamApproval(standaloneExamId: string): Promise<StandaloneExam>;
  approveStandaloneExam(standaloneExamId: string): Promise<StandaloneExam>;
  getStandaloneExamsWaitingForApproval(): Promise<StandaloneExam[]>;
  getMyStandaloneExams(userId: string): Promise<StandaloneExam[]>;
}
