import { QuestionType } from '../../entities/QuestionType.entity';
import { CreateQuestionTypeInput } from '../../schema/questionTypes/CreateQuestionTypeSchema';

export interface IQuestionTypeService {
  createQuestionType(
    input: CreateQuestionTypeInput,
  ): Promise<QuestionType | void>;
}
