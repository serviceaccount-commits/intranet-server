import { inject, injectable } from 'inversify';
import { IQuestionTypeService } from '../interfaces/questionTypes/questionType.service.interface';
import { QuestionType } from '../entities/QuestionType.entity';
import {
  CreateQuestionTypeInput,
  CreateQuestionTypeSchema,
} from '../schema/questionTypes/CreateQuestionTypeSchema';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IQuestionTypeRepository } from '../interfaces/questionTypes/questionType.repository.interface';
import { AppDataSource } from '../../../../shared/database/data-source';
import ES from '../../../../shared/types/enum/ES';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';

@injectable()
export class QuestionTypeService implements IQuestionTypeService {
  constructor(
    @inject(TYPES.IQuestionTypeRepository)
    private questionTypeRepository: IQuestionTypeRepository,
  ) {}

  async createQuestionType(
    input: CreateQuestionTypeInput,
  ): Promise<QuestionType | void> {
    const validatedDate = CreateQuestionTypeSchema.parse(input);
    return await AppDataSource.manager.transaction(async (_t) => {
      if (validatedDate.typeName === ES.MULTIPLE_SELECTION) {
        const existingMultipleSelection =
          await this.questionTypeRepository.findMultipleSelection();

        if (existingMultipleSelection) {
          throw new BusinessLogicError(
            'Multiple Selection Question Type already exists',
          );
        }
        const newQuestionType = new QuestionType();
        newQuestionType.type_name = ES.MULTIPLE_SELECTION;
        return await this.questionTypeRepository.create(newQuestionType);
      } else if (validatedDate.typeName === ES.TRUE_FALSE) {
        const existingTrueFalse =
          await this.questionTypeRepository.findTrueFalse();

        if (existingTrueFalse) {
          throw new BusinessLogicError(
            'True/False Question Type already exists',
          );
        }

        const newQuestionType = new QuestionType();
        newQuestionType.type_name = ES.TRUE_FALSE;
        return await this.questionTypeRepository.create(newQuestionType);
      }
    });
  }
}
