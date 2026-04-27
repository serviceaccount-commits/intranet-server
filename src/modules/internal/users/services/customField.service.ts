import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { AppDataSource } from '../../../../shared/database/data-source';
import { ICustomFieldService } from '../interfaces/customFields/customField.service.interface';
import ES from '../../../../shared/types/enum/ES';
import { CustomField } from '../entities/CustomField.entity';
import ICustomFieldRepository from '../interfaces/users/customField.repository.interface';
import { IUserRepository } from '../interfaces/users/user.repository.interface';
import { UserCustomFieldValue } from '../entities/UserCustomFieldValue.entity';
import { IStaffDirectoryOrderService } from '../../../external/humanResources/interfaces/staffDirectoryOrders/staffDirectoryOrder.service.interface';

@injectable()
export class CustomFieldService implements ICustomFieldService {
  constructor(
    @inject(TYPES.ICustomFieldRepository)
    private customFieldRepository: ICustomFieldRepository,
    @inject(TYPES.IUserRepository)
    private userRepository: IUserRepository,
    @inject(TYPES.IStaffDirectoryOrderService)
    private staffDirectoryOrderService: IStaffDirectoryOrderService,
  ) {}

  async createCustomField(
    fieldName: string,
    dataType: ES.STRING | ES.BOOLEAN | ES.DATE,
    visibility: ES.PUBLIC | ES.PRIVATE,
    status: ES.ACTIVE | ES.INACTIVE,
    order: number, //! I need to make this automatic
  ): Promise<CustomField> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const existingCustomField =
        await this.customFieldRepository.findByName(fieldName);
      if (existingCustomField) {
        throw new Error('Custom field already exists');
      }

      const newCustomField = new CustomField();
      newCustomField.field_name = fieldName;
      newCustomField.data_type = dataType;
      newCustomField.visibility = visibility;
      newCustomField.status = status;

      let customField = await this.customFieldRepository.create(newCustomField);

      const users = await this.userRepository.findAllUsers();

      const userFieldValues = users.map((user) => {
        const userFieldValue = new UserCustomFieldValue();
        userFieldValue.user = user;
        userFieldValue.user_id = user.user_id;
        userFieldValue.field = customField;
        userFieldValue.field_id = customField.field_id;
        userFieldValue.value = '';
        return userFieldValue;
      });

      await this.customFieldRepository.createUserFieldValue(userFieldValues);

      await this.staffDirectoryOrderService.createStaffDirectoryOrder(
        order,
        fieldName,
        true,
      );

      return customField;
    });
  }

  async getCustomFields(): Promise<CustomField[]> {
    return await this.customFieldRepository.findAll();
  }

  async getCustomFieldById(id: string): Promise<CustomField> {
    const customField = await this.customFieldRepository.findById(id);
    if (!customField) {
      throw new Error(`Custom field with id ${id} not found`);
    }
    return customField;
  }

  async deleteCustomField(customFieldId: string): Promise<void> {
    await this.customFieldRepository.delete(customFieldId);
  }
}
