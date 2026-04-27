import { Option } from '../../entities/Option.entity';

export interface IOptionRepository {
  create(option: Option): Promise<Option>;
  save(optionOrOptions: Option | Option[]): Promise<Option | Option[]>;
  saveMultiple(optionOrOptions: Option[]): Promise<Option[]>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Option[]>;
  findById(
    id: string,
    withQuestion: boolean,
    withExam: boolean,
  ): Promise<Option | null>;
  findAllByQuestionId(
    questionId: string,
    getOnlyActives: boolean,
  ): Promise<Option[]>;
  deleteAllByQuestionId(questionId: string): Promise<void>;
}
