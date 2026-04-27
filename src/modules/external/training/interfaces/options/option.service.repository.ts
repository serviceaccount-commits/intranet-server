import { Option } from '../../entities/Option.entity';
import { CreateOptionInput } from '../../schema/options/CreateOptionSchema';
import { UpdateOptionInput } from '../../schema/options/UpdateOptionSchema';

export interface IOptionService {
  createOption(input: CreateOptionInput): Promise<Option>;
  updateOption(
    optionId: string,
    input: UpdateOptionInput,
  ): Promise<Option | Option[]>;
  deleteOption(optionId: string): Promise<void>;
  replicateOptionsFromQuestionIdToQuestionId(
    sourceQuestionId: string,
    targetQuestionId: string,
  ): Promise<void>;
  deactivateMultipleSelectionOptions(questionId: string): Promise<void>;
  activateMultipleSelectionOptions(questionId: string): Promise<Option[]>;
  deleteAllOptionsFromQuestion(questionId: string): Promise<void>;
  createTrueFalseOptions(questionId: string): Promise<Option[]>;
}
