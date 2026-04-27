import { inject, injectable } from 'inversify';
import { IOptionService } from '../interfaces/options/option.service.repository';
import { Option } from '../entities/Option.entity';
import {
  CreateOptionInput,
  CreateOptionSchema,
} from '../schema/options/CreateOptionSchema';
import { AppDataSource } from '../../../../shared/database/data-source';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IOptionRepository } from '../interfaces/options/option.repository.interface';
import { IQuestionRepository } from '../interfaces/questions/question.repository.interface';
import {
  UpdateOptionInput,
  UpdateOptionSchema,
} from '../schema/options/UpdateOptionSchema';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { IExamRepository } from '../interfaces/exams/exam.repository.interface';
import ES from '../../../../shared/types/enum/ES';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';

@injectable()
export class OptionService implements IOptionService {
  constructor(
    @inject(TYPES.IOptionRepository)
    private optionRepository: IOptionRepository,
    @inject(TYPES.IQuestionRepository)
    private questionRepository: IQuestionRepository,
    @inject(TYPES.IExamRepository)
    private examRepository: IExamRepository,
  ) {}

  async createOption(input: CreateOptionInput): Promise<Option> {
    const validatedData = CreateOptionSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      const question = await this.questionRepository.findById(
        validatedData.questionId,
        false,
        false,
      );

      if (!question) {
        throw new NotFoundError('Question not found');
      }
      if (question.question_type.type_name === ES.TRUE_FALSE) {
        throw new BusinessLogicError(
          'Cannot create options for True/False questions',
        );
      }

      const newOption = new Option();
      newOption.option_text = '';
      newOption.is_correct = false;
      newOption.question_id = validatedData.questionId;

      return await this.optionRepository.create(newOption);
    });
  }

  async updateOption(
    optionId: string,
    input: UpdateOptionInput,
  ): Promise<Option | Option[]> {
    const validatedData = UpdateOptionSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      const exam = await this.examRepository.findById(
        validatedData.examId,
        false,
      );
      if (!exam) {
        throw new NotFoundError('Exam not found');
      }

      if (exam.exam_status !== ES.DRAFT) {
        throw new BusinessLogicError('Exam is not in draft status');
      }

      const option = await this.optionRepository.findById(
        optionId,
        false,
        false,
      );

      if (!option) {
        throw new NotFoundError('Option not found');
      }

      const question = await this.questionRepository.findById(
        validatedData.questionId,
        false,
        false,
      );

      if (!question) {
        throw new NotFoundError('Question not found');
      }

      if (question.question_type.type_name === ES.MULTIPLE_SELECTION) {
        option.option_text = validatedData.optionText;
        option.is_correct = validatedData.isCorrect;
        return await this.optionRepository.save(option);
      } else if (question.question_type.type_name === ES.TRUE_FALSE) {
        const allOptions = await this.optionRepository.findAllByQuestionId(
          validatedData.questionId,
          true,
        );

        // For True/False, selecting one option deselects the other.
        // This logic ensures only one option is marked as correct.
        for (const opt of allOptions) {
          // Set the clicked option to true, all others to false.
          opt.is_correct = opt.option_id === optionId;
        }

        // Save all changes in one go. This is more efficient.
        await this.optionRepository.save(allOptions);

        const updatedOption = allOptions.find(
          (opt) => opt.option_id === optionId,
        );
        if (!updatedOption) {
          throw new BusinessLogicError(
            'Failed to find the updated option after saving.',
          );
        }

        return updatedOption;
        // Return the specific option that was updated.
      } else {
        throw new BusinessLogicError('Invalid question type');
      }
    });
  }

  async deleteOption(optionId: string): Promise<void> {
    await AppDataSource.manager.transaction(async (_t) => {
      const option = await this.optionRepository.findById(optionId, true, true);

      if (!option) {
        throw new NotFoundError('Option not found');
      }

      if (option.question.exam.exam_status !== ES.DRAFT) {
        throw new BusinessLogicError('Exam is not in draft status');
      }

      if (option.question.question_type.type_name === ES.TRUE_FALSE) {
        throw new BusinessLogicError(
          'Cannot delete options for True/False questions',
        );
      }

      await this.optionRepository.delete(optionId);
    });
  }

  async replicateOptionsFromQuestionIdToQuestionId(
    sourceQuestionId: string,
    targetQuestionId: string,
  ): Promise<void> {
    await AppDataSource.manager.transaction(async (_t) => {
      const sourceQuestion = await this.questionRepository.findById(
        sourceQuestionId,
        false,
        false,
      );
      const targetQuestion = await this.questionRepository.findById(
        targetQuestionId,
        false,
        false,
      );

      if (!sourceQuestion || !targetQuestion) {
        throw new Error('Source or target question not found');
      }

      const sourceOptions = await this.optionRepository.findAllByQuestionId(
        sourceQuestionId,
        true,
      );

      for (const sourceOption of sourceOptions) {
        const newOption = new Option();
        newOption.option_text = sourceOption.option_text;
        newOption.is_correct = sourceOption.is_correct;
        newOption.question_id = targetQuestionId;

        await this.optionRepository.create(newOption);
      }
    });
  }

  async deactivateMultipleSelectionOptions(questionId: string): Promise<void> {
    await AppDataSource.manager.transaction(async (_t) => {
      const options = await this.optionRepository.findAllByQuestionId(
        questionId,
        true,
      );
      let optionsToSave: Option[] = [];
      for (const option of options) {
        if (option.question_id === questionId) {
          option.status = ES.INACTIVE;
          optionsToSave.push(option);
        }
      }
      await this.optionRepository.save(optionsToSave);
    });
  }

  async activateMultipleSelectionOptions(
    questionId: string,
  ): Promise<Option[]> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const options = await this.optionRepository.findAllByQuestionId(
        questionId,
        false,
      );
      let optionsToSave: Option[] = [];
      for (const option of options) {
        if (option.question_id === questionId) {
          option.status = ES.ACTIVE;
          optionsToSave.push(option);
        }
      }
      return await this.optionRepository.saveMultiple(optionsToSave);
    });
  }

  async deleteAllOptionsFromQuestion(questionId: string): Promise<void> {
    await AppDataSource.manager.transaction(async (_t) => {
      await this.optionRepository.deleteAllByQuestionId(questionId);
    });
  }

  async createTrueFalseOptions(questionId: string): Promise<Option[]> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const question = await this.questionRepository.findById(
        questionId,
        false,
        false,
      );
      if (!question) {
        throw new Error('Question not found');
      }
      const trueOption = new Option();
      trueOption.option_text = 'True';
      trueOption.is_correct = true;
      trueOption.question_id = questionId;
      trueOption.question = question;

      const falseOption = new Option();
      falseOption.option_text = 'False';
      falseOption.is_correct = false;
      falseOption.question_id = questionId;
      falseOption.question = question;

      let ret: Option[] = [];

      const trueOptionCreated = await this.optionRepository.create(trueOption);
      const falseOptionCreated =
        await this.optionRepository.create(falseOption);

      ret.push(trueOptionCreated);
      ret.push(falseOptionCreated);

      return ret;
    });
  }
}
