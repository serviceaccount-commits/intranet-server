import { Question } from '../../entities/Question.entity';

export interface IQuestionRepository {
  create(question: Question): Promise<Question>;
  save(question: Question): Promise<Question>;
  findAll(): Promise<Question[]>;
  findById(
    id: string,
    withExam: boolean,
    withOptions: boolean,
  ): Promise<Question | null>;
  findAllByExamId(examId: string, withOptions: boolean): Promise<Question[]>;
  delete(id: string): Promise<void>;
  deleteAllByExamId(examId: string): Promise<void>;
}
