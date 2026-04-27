import { Exam } from '../../entities/Exam.entity';
import { StandaloneExam } from '../../entities/StandaloneExam.entity';

export interface IExamRepository {
  create(exam: Exam): Promise<Exam>;
  createStandaloneExam(standaloneExam: StandaloneExam): Promise<StandaloneExam>;
  save(exam: Exam): Promise<Exam>;
  saveStandaloneExam(standaloneExam: StandaloneExam): Promise<StandaloneExam>;
  saveMany(exam: Exam[]): Promise<Exam[]>;
  findAll(): Promise<Exam[]>;
  findById(id: string, withQuestions: boolean): Promise<Exam | null>;
  findAllByClassId(classId: string): Promise<Exam[]>;
  findExamByStandaloneExamId(standaloneExamId: string): Promise<Exam | null>;
  findStandaloneExamById(
    standaloneExamId: string,
  ): Promise<StandaloneExam | null>;
  findDetailedByExamId(examId: string): Promise<Exam | null>;
  findDetailedByStandaloneExamId(examId: string): Promise<Exam | null>;
  findAllPlainByClassId(classId: string): Promise<Exam[]>;
  delete(id: string): Promise<void>;
  findAllStandaloneExamsWaitingForApproval(): Promise<StandaloneExam[]>;
  findAllStandaloneExamsByUserId(userId: string): Promise<StandaloneExam[]>;
}
