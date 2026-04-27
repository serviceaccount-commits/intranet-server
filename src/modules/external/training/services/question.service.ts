import { inject, injectable } from 'inversify';
import { IQuestionService } from '../interfaces/questions/question.service.interface';
import { Question } from '../entities/Question.entity';
import {
  CreateQuestionInput,
  CreateQuestionSchema,
} from '../schema/questions/CreateQuestionSchema';
import { AppDataSource } from '../../../../shared/database/data-source';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IExamRepository } from '../interfaces/exams/exam.repository.interface';
import { IQuestionTypeRepository } from '../interfaces/questionTypes/questionType.repository.interface';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import ES from '../../../../shared/types/enum/ES';
import { IOptionService } from '../interfaces/options/option.service.repository';
import {
  UpdateQuestionInput,
  UpdateQuestionSchema,
} from '../schema/questions/UpdateQuestionSchema';
import { IQuestionRepository } from '../interfaces/questions/question.repository.interface';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import { Option } from '../entities/Option.entity';
import { QuestionWithSeparatedOptions } from '../types/Training.types';

@injectable()
export class QuestionService implements IQuestionService {
  constructor(
    @inject(TYPES.IExamRepository) private examRepository: IExamRepository,
    @inject(TYPES.IQuestionTypeRepository)
    private questionTypeRepository: IQuestionTypeRepository,
    @inject(TYPES.IQuestionRepository)
    private questionRepository: IQuestionRepository,
    @inject(TYPES.IOptionService) private optionService: IOptionService,
  ) {}

  async createQuestion(input: CreateQuestionInput): Promise<Question> {
    const validatedDate = CreateQuestionSchema.parse(input);
    return await AppDataSource.manager.transaction(async (_t) => {
      const existingExam = await this.examRepository.findById(
        validatedDate.examId,
        false,
      );

      const multipleSelectionQType =
        await this.questionTypeRepository.findMultipleSelection();

      if (!multipleSelectionQType) {
        throw new NotFoundError('Question type', ES.MULTIPLE_SELECTION);
      }

      if (!existingExam) {
        throw new Error('Exam not found');
      }

      const newQuestion = new Question();
      newQuestion.exam = existingExam;
      newQuestion.exam_id = existingExam.exam_id;
      newQuestion.question_text = '';
      newQuestion.question_type_id = multipleSelectionQType.question_type_id;
      newQuestion.question_type = multipleSelectionQType;

      const question = await this.questionRepository.create(newQuestion);

      question.options = [
        await this.optionService.createOption({
          questionId: question.question_id,
        }),
      ];

      return question;
    });
  }

  async updateQuestion(
    questionId: string,
    input: UpdateQuestionInput,
  ): Promise<QuestionWithSeparatedOptions> {
    const validatedData = UpdateQuestionSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      const exam = await this.examRepository.findById(
        validatedData.examId,
        false,
      );

      if (!exam) {
        throw new NotFoundError('Exam', validatedData.examId);
      }

      if (exam.exam_status !== ES.DRAFT) {
        throw new BusinessLogicError('Exam is not in draft status');
      }

      const question = await this.questionRepository.findById(
        questionId,
        false,
        true,
      );

      if (!question) {
        throw new NotFoundError('Question', questionId);
      }

      if (question.question_text !== validatedData.questionText) {
        question.question_text = validatedData.questionText;
      }

      const questionType = await this.questionTypeRepository.findByTypeName(
        validatedData.questionType,
      );

      if (!questionType) {
        throw new NotFoundError('Question Type', validatedData.questionType);
      }

      let optionsResponse: Option[] = [];

      if (question.question_type.type_name !== questionType.type_name) {
        question.question_type = questionType;
        question.question_type_id = questionType.question_type_id;
        if (questionType.type_name === ES.MULTIPLE_SELECTION) {
          await this.optionService.deleteAllOptionsFromQuestion(questionId);
        } else if (questionType.type_name === ES.TRUE_FALSE) {
          await this.optionService.deactivateMultipleSelectionOptions(
            questionId,
          );
        }

        if (questionType.type_name === ES.TRUE_FALSE && question.options) {

          optionsResponse =
            await this.optionService.createTrueFalseOptions(questionId);

          question.options = [...question.options, ...optionsResponse];
        } else if (questionType.type_name === ES.MULTIPLE_SELECTION) {

          const tempOptionsResponse =
            await this.optionService.activateMultipleSelectionOptions(
              questionId,
            );

          question.options = tempOptionsResponse;

          optionsResponse = tempOptionsResponse;
        }
      }
      const responseQuestion = await this.questionRepository.save(question);

      if (optionsResponse.length === 0 && question.options) {
        optionsResponse = question.options;
      }

      return {
        question: responseQuestion,
        options: optionsResponse,
      };
    });
  }

  async deleteQuestion(questionId: string): Promise<void> {
    await AppDataSource.manager.transaction(async (_t) => {
      const question = await this.questionRepository.findById(
        questionId,
        true,
        false,
      );

      if (!question) {
        throw new NotFoundError('Question not found');
      }

      if (question.exam.exam_status !== ES.DRAFT) {
        throw new BusinessLogicError('Exam is not in draft status');
      }

      await this.optionService.deleteAllOptionsFromQuestion(questionId);

      await this.questionRepository.delete(questionId);
    });
  }

  async deleteAllQuestionsFromExam(examId: string): Promise<void> {
    await AppDataSource.manager.transaction(async (_t) => {
      const exam = await this.examRepository.findById(examId, true);

      if (!exam) {
        throw new NotFoundError('Exam not found');
      }
      if (exam.exam_status !== ES.DRAFT) {
        throw new BusinessLogicError('Exam is not in draft status');
      }

      const questions = await this.questionRepository.findAllByExamId(
        examId,
        false,
      );

      if (!questions) {
        return;
      }

      for (const question of questions) {
        await this.optionService.deleteAllOptionsFromQuestion(
          question.question_id,
        );
      }
      await this.questionRepository.deleteAllByExamId(examId);
    });
  }

  async replicateQuestionsFromExamIdToExamId(
    sourceExamId: string,
    targetExamId: string,
  ): Promise<void> {
    await AppDataSource.manager.transaction(async (_t) => {
      const sourceExam = await this.examRepository.findById(sourceExamId, true);
      const targetExam = await this.examRepository.findById(targetExamId, true);

      if (!sourceExam || !sourceExam.questions) {
        throw new NotFoundError('Source Exam or its questions not found');
      }

      if (!targetExam) {
        throw new NotFoundError('Target Exam not found');
      }

      for (const sourceQuestion of sourceExam.questions) {
        const newQuestion = new Question();
        newQuestion.exam_id = targetExam.exam_id;
        newQuestion.question_text = sourceQuestion.question_text;
        newQuestion.question_type_id = sourceQuestion.question_type_id;

        const createdQuestion =
          await this.questionRepository.create(newQuestion);

        if (sourceQuestion.options) {
          await this.optionService.replicateOptionsFromQuestionIdToQuestionId(
            sourceQuestion.question_id,
            createdQuestion.question_id,
          );
        }
      }
    });
  }
}
