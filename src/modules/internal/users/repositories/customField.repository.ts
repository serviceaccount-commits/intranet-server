import { injectable } from 'inversify';
import ICustomFieldRepository from '../interfaces/users/customField.repository.interface';
import { CustomField } from '../entities/CustomField.entity';
import { AppDataSource } from '../../../../shared/database/data-source';
import { UserCustomFieldValue } from '../entities/UserCustomFieldValue.entity';

@injectable()
export class CustomFieldRepository implements ICustomFieldRepository {
  async create(customField: CustomField): Promise<CustomField> {
    return await AppDataSource.manager.save(customField);
  }

  async createUserFieldValue(
    userFieldValue: UserCustomFieldValue[],
  ): Promise<void> {
    await AppDataSource.manager.save(userFieldValue);
  }

  async findAll(): Promise<CustomField[]> {
    return await AppDataSource.manager.find(CustomField);
  }

  async findById(id: string): Promise<CustomField | null> {
    return await AppDataSource.manager.findOne(CustomField, {
      where: { field_id: id },
    });
  }

  async findByName(name: string): Promise<CustomField | null> {
    return await AppDataSource.manager.findOne(CustomField, {
      where: { field_name: name },
    });
  }

  async delete(customFieldId: string): Promise<void> {
    const customField = await this.findById(customFieldId);
    if (!customField) {
      throw new Error(`Custom field with id ${customFieldId} not found`);
    }

    await AppDataSource.manager.remove(customField);
  }
}
