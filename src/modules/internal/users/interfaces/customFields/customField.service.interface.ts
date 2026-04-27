import ES from '../../../../../shared/types/enum/ES';
import { CustomField } from '../../entities/CustomField.entity';

export interface ICustomFieldService {
  createCustomField(
    fieldName: string,
    dataType: ES.STRING | ES.BOOLEAN | ES.DATE,
    visibility: ES.PUBLIC | ES.PRIVATE,
    status: ES.ACTIVE | ES.INACTIVE,
    order: number,
  ): Promise<CustomField>;
  getCustomFields(): Promise<CustomField[]>;
  getCustomFieldById(id: string): Promise<CustomField>;
  deleteCustomField(customFieldId: string): Promise<void>;
}
