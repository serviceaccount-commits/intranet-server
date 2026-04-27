import { CustomField } from '../../entities/CustomField.entity';
import { UserCustomFieldValue } from '../../entities/UserCustomFieldValue.entity';

interface ICustomFieldRepository {
  create(customField: CustomField): Promise<CustomField>;
  createUserFieldValue(userFieldValue: UserCustomFieldValue[]): Promise<void>;
  findAll(): Promise<CustomField[]>;
  findById(id: string): Promise<CustomField | null>;
  findByName(name: string): Promise<CustomField | null>;

  //! updateCustomField(): Promise<CustomField>;

  delete(customFieldId: string): Promise<void>;
}

export default ICustomFieldRepository;
