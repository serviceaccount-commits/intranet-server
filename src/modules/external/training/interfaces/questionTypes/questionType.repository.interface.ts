import { QuestionType } from '../../entities/QuestionType.entity';

export interface IQuestionTypeRepository {
  create(questionType: QuestionType): Promise<QuestionType>;
  save(questionType: QuestionType): Promise<QuestionType>;
  findAll(): Promise<QuestionType[]>;
  findMultipleSelection(): Promise<QuestionType | null>;
  findTrueFalse(): Promise<QuestionType | null>;
  findById(id: string): Promise<QuestionType | null>;
  findByTypeName(typeName: string): Promise<QuestionType | null>;
}
