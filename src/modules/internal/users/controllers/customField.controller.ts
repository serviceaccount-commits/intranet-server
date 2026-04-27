import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { Request, Response } from 'express';
import { ICustomFieldService } from '../interfaces/customFields/customField.service.interface';

@injectable()
export class CustomFieldController {
  constructor(
    @inject(TYPES.ICustomFieldService)
    private customFieldService: ICustomFieldService,
  ) {}

  async createCustomField(req: Request, res: Response) {
    try {
      const { fieldName, dataType, visibilty, status, order } = req.body;
      const customField = await this.customFieldService.createCustomField(
        fieldName,
        dataType,
        visibilty,
        status,
        order,
      );
      res.status(201).json(customField);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getCustomFields(_req: Request, res: Response) {
    const customFields = await this.customFieldService.getCustomFields();

    res.json(customFields);
  }

  async getCustomFieldById(req: Request, res: Response) {
    const { customFieldId } = req.params;

    if (!customFieldId) {
      return res.status(400);
    }

    const customField =
      await this.customFieldService.getCustomFieldById(customFieldId);

    return res.json(customField);
  }

  async deleteCustomField(customFieldId: string) {
    await this.customFieldService.deleteCustomField(customFieldId);
  }
}
