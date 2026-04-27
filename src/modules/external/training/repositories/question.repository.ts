import { injectable } from 'inversify';
import { IQuestionRepository } from '../interfaces/questions/question.repository.interface';
import { Question } from '../entities/Question.entity';
import { AppDataSource } from '../../../../shared/database/data-source';

@injectable()
export class QuestionRepository implements IQuestionRepository {
  async create(question: Question): Promise<Question> {
    return AppDataSource.manager.save(question);
  }

  async save(question: Question): Promise<Question> {
    return AppDataSource.manager.save(question);
  }

  async findAll(): Promise<Question[]> {
    return AppDataSource.manager.find(Question);
  }
  async findById(
    id: string,
    withExam: boolean,
    withOptions: boolean = false,
  ): Promise<Question | null> {
    if (withExam) {
      return AppDataSource.manager.findOne(Question, {
        where: {
          question_id: id,
        },
        relations: {
          question_type: true,
          exam: true,
        },
      });
    }

    if (withOptions) {
      return AppDataSource.manager
        .createQueryBuilder(Question, 'question')
        .leftJoinAndSelect('question.options', 'options')
        .leftJoinAndSelect('question.question_type', 'question_type')
        .where('question.question_id = :id', { id })
        .addOrderBy('options.created_at', 'ASC')
        .getOne();
    }

    return AppDataSource.manager.findOne(Question, {
      where: {
        question_id: id,
      },
      relations: {
        question_type: true,
      },
    });
  }

  async findAllByExamId(
    examId: string,
    withOptions: boolean = false,
  ): Promise<Question[]> {
    if (withOptions) {
      return AppDataSource.manager.find(Question, {
        where: {
          exam_id: examId,
        },
        relations: {
          question_type: true,
          options: true,
        },
      });
    }

    return AppDataSource.manager.find(Question, {
      where: {
        exam_id: examId,
      },
      relations: {
        question_type: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await AppDataSource.manager.delete(Question, id);
  }

  async deleteAllByExamId(examId: string): Promise<void> {
    await AppDataSource.manager.delete(Question, {
      exam_id: examId,
    });
  }
}
