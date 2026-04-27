import { injectable } from 'inversify';
import { IQuestionTypeRepository } from '../interfaces/questionTypes/questionType.repository.interface';
import { QuestionType } from '../entities/QuestionType.entity';
import { AppDataSource } from '../../../../shared/database/data-source';
import ES from '../../../../shared/types/enum/ES';

@injectable()
export class QuestionTypeRepository implements IQuestionTypeRepository {
  async create(questionType: QuestionType): Promise<QuestionType> {
    return await AppDataSource.manager.save(questionType);
  }
  async save(questionType: QuestionType): Promise<QuestionType> {
    return await AppDataSource.manager.save(questionType);
  }
  async findAll(): Promise<QuestionType[]> {
    return await AppDataSource.manager.find(QuestionType);
  }

  async findMultipleSelection(): Promise<QuestionType | null> {
    return await AppDataSource.manager.findOne(QuestionType, {
      where: {
        type_name: ES.MULTIPLE_SELECTION,
      },
    });
  }

  async findTrueFalse(): Promise<QuestionType | null> {
    return await AppDataSource.manager.findOne(QuestionType, {
      where: {
        type_name: ES.TRUE_FALSE,
      },
    });
  }

  async findById(id: string): Promise<QuestionType | null> {
    return await AppDataSource.manager.findOne(QuestionType, {
      where: {
        question_type_id: id,
      },
    });
  }

  async findByTypeName(typeName: string): Promise<QuestionType | null> {
    return await AppDataSource.manager.findOne(QuestionType, {
      where: {
        type_name: typeName,
      },
    });
  }
}
