import { Question } from '../../entities/Question.entity';
import { CreateQuestionInput } from '../../schema/questions/CreateQuestionSchema';
import { UpdateQuestionInput } from '../../schema/questions/UpdateQuestionSchema';
import { QuestionWithSeparatedOptions } from '../../types/Training.types';

export interface IQuestionService {
  createQuestion(input: CreateQuestionInput): Promise<Question>;
  updateQuestion(
    questionId: string,
    input: UpdateQuestionInput,
  ): Promise<QuestionWithSeparatedOptions>;
  deleteQuestion(questionId: string): Promise<void>;
  deleteAllQuestionsFromExam(examId: string): Promise<void>;
  replicateQuestionsFromExamIdToExamId(
    sourceExamId: string,
    targetExamId: string,
  ): Promise<void>;
}
