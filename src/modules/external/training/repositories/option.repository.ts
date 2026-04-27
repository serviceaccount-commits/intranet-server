import { injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { IOptionRepository } from '../interfaces/options/option.repository.interface';
import { Option } from '../entities/Option.entity';
import ES from '../../../../shared/types/enum/ES';

@injectable()
export class OptionRepository implements IOptionRepository {
  async create(option: Option): Promise<Option> {
    return AppDataSource.manager.save(option);
  }

  async save(optionOrOptions: Option | Option[]): Promise<Option | Option[]> {
    return AppDataSource.manager.save(optionOrOptions);
  }

  async saveMultiple(optionOrOptions: Option[]): Promise<Option[]> {
    return AppDataSource.manager.save(optionOrOptions);
  }

  async delete(id: string): Promise<void> {
    await AppDataSource.manager.delete(Option, id);
  }

  async findAll(): Promise<Option[]> {
    return AppDataSource.manager.find(Option);
  }
  async findById(
    id: string,
    withQuestion: boolean,
    withExam: boolean,
  ): Promise<Option | null> {
    if (withQuestion && !withExam) {
      return AppDataSource.manager.findOne(Option, {
        where: {
          option_id: id,
        },
        relations: {
          question: { question_type: true },
        },
      });
    } else if (withQuestion && withExam) {
      return AppDataSource.manager.findOne(Option, {
        where: {
          option_id: id,
        },
        relations: {
          question: { question_type: true, exam: true },
        },
      });
    }
    return AppDataSource.manager.findOne(Option, {
      where: {
        option_id: id,
      },
    });
  }

  async findAllByQuestionId(
    questionId: string,
    getOnlyActives: boolean,
  ): Promise<Option[]> {
    const queryBuilder = AppDataSource.manager
      .createQueryBuilder(Option, 'option')
      .leftJoinAndSelect('option.question', 'question')
      .where('question.question_id = :questionId', { questionId });

    if (getOnlyActives) {
      queryBuilder.andWhere('option.status = :status', { status: ES.ACTIVE });
    } else {
      queryBuilder.andWhere('option.status = :status', { status: ES.INACTIVE });
    }

    return await queryBuilder.orderBy('option.created_at', 'ASC').getMany();
  }

  async deleteAllByQuestionId(questionId: string): Promise<void> {
    await AppDataSource.manager.delete(Option, {
      question_id: questionId,
      status: ES.ACTIVE,
    });
  }
}
