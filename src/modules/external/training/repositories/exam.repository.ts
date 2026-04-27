import { injectable } from 'inversify';
import { IExamRepository } from '../interfaces/exams/exam.repository.interface';
import { Exam } from '../entities/Exam.entity';
import { AppDataSource } from '../../../../shared/database/data-source';
import ES from '../../../../shared/types/enum/ES';
import { StandaloneExam } from '../entities/StandaloneExam.entity';

@injectable()
export class ExamRepository implements IExamRepository {
  async create(exam: Exam): Promise<Exam> {
    return await AppDataSource.manager.save(exam);
  }

  async createStandaloneExam(
    standaloneExam: StandaloneExam,
  ): Promise<StandaloneExam> {
    return await AppDataSource.manager.save(standaloneExam);
  }

  async findStandaloneExamById(
    standaloneExamId: string,
  ): Promise<StandaloneExam | null> {
    return await AppDataSource.manager.findOne(StandaloneExam, {
      where: {
        standalone_exam_id: standaloneExamId,
      },
    });
  }

  async save(exam: Exam): Promise<Exam> {
    return await AppDataSource.manager.save(exam);
  }

  async saveStandaloneExam(
    standaloneExam: StandaloneExam,
  ): Promise<StandaloneExam> {
    return await AppDataSource.manager.save(standaloneExam);
  }

  async saveMany(exam: Exam[]): Promise<Exam[]> {
    return await AppDataSource.manager.save(exam);
  }

  async findAll(): Promise<Exam[]> {
    return await AppDataSource.manager.find(Exam);
  }

  async findById(
    id: string,
    withQuestions: boolean = false,
  ): Promise<Exam | null> {
    if (withQuestions) {
      return await AppDataSource.manager.findOne(Exam, {
        where: {
          exam_id: id,
        },
        relations: {
          class: true,
          questions: { options: true },
        },
      });
    }
    return await AppDataSource.manager.findOne(Exam, {
      where: {
        exam_id: id,
      },
      relations: {
        class: true,
      },
    });
  }

  async findDetailedByExamId(examId: string): Promise<Exam | null> {
    return await AppDataSource.manager
      .createQueryBuilder(Exam, 'exam')
      .leftJoinAndSelect('exam.standalone_exam', 'standalone_exam')
      .leftJoinAndSelect('exam.questions', 'questions')
      .leftJoinAndSelect('questions.question_type', 'question_type')
      .leftJoinAndSelect(
        'questions.options',
        'options',
        'options.status = :status',
        { status: ES.ACTIVE },
      )
      .where('exam.exam_id = :examId', { examId })
      .getOne();
  }

  async findDetailedByStandaloneExamId(
    standaloneExamId: string,
  ): Promise<Exam | null> {
    return await AppDataSource.manager
      .createQueryBuilder(Exam, 'exam')
      .leftJoinAndSelect('exam.questions', 'questions')
      .leftJoinAndSelect('questions.question_type', 'question_type')
      .leftJoinAndSelect(
        'questions.options',
        'options',
        'options.status = :status',
        { status: ES.ACTIVE },
      )
      .where('exam.standalone_exam_id = :standaloneExamId', {
        standaloneExamId,
      })
      .getOne();
  }

  async findExamByStandaloneExamId(
    standaloneExamId: string,
  ): Promise<Exam | null> {
    return await AppDataSource.manager
      .createQueryBuilder(Exam, 'exam')
      .leftJoinAndSelect('exam.class', 'class')
      .leftJoinAndSelect('exam.questions', 'questions')
      .leftJoinAndSelect('questions.question_type', 'question_type')
      .leftJoinAndSelect(
        'questions.options',
        'options',
        'options.status = :status',
        { status: ES.ACTIVE },
      )
      .where('exam.standalone_exam_id = :standaloneExamId', {
        standaloneExamId,
      })
      .getOne();
  }

  async findAllByClassId(classId: string): Promise<Exam[]> {
    return await AppDataSource.manager
      .createQueryBuilder(Exam, 'exam')
      .leftJoinAndSelect('exam.class', 'class')
      .leftJoinAndSelect('exam.questions', 'questions')
      .leftJoinAndSelect('questions.question_type', 'question_type')
      .leftJoinAndSelect(
        'questions.options',
        'options',
        'options.status = :status',
        { status: ES.ACTIVE },
      )
      .where('class.class_id = :classId', { classId })
      .orderBy('exam.created_at', 'DESC')
      .orderBy('exam.version', 'DESC')
      .addOrderBy('questions.created_at', 'ASC')
      .addOrderBy('options.created_at', 'ASC')
      .getMany();
  }

  async findAllPlainByClassId(classId: string): Promise<Exam[]> {
    return await AppDataSource.manager
      .createQueryBuilder(Exam, 'exam')
      .select([
        'exam.exam_id',
        'exam.exam_title',
        'exam.version',
        'exam.exam_status',
        'exam.created_at',
      ])
      .where('exam.class_id = :classId', { classId })
      .orderBy('exam.created_at', 'DESC')
      .getMany();
  }

  async delete(id: string): Promise<void> {
    await AppDataSource.manager.delete(Exam, id);
  }

  async findAllStandaloneExamsWaitingForApproval(): Promise<StandaloneExam[]> {
    return await AppDataSource.manager
      .createQueryBuilder(StandaloneExam, 'standalone_exam')
      .leftJoinAndSelect('standalone_exam.user', 'user')
      .leftJoinAndSelect('standalone_exam.approved_by', 'approved_by')
      .leftJoinAndSelect('standalone_exam.exam', 'exam')
      .where('standalone_exam.standalone_exam_status = :status', {
        status: ES.AWAITING_APPROVAL,
      })
      .getMany();
  }

  async findAllStandaloneExamsByUserId(
    userId: string,
  ): Promise<StandaloneExam[]> {
    return await AppDataSource.manager
      .createQueryBuilder(StandaloneExam, 'standalone_exam')
      .leftJoinAndSelect('standalone_exam.user', 'user')
      .leftJoinAndSelect('standalone_exam.approved_by', 'approved_by')
      .leftJoinAndSelect('standalone_exam.exam', 'exam')
      .where('standalone_exam.user_id = :userId', { userId })
      .getMany();
  }
}
