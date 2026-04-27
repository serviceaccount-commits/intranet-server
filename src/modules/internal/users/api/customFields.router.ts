import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { CustomFieldController } from '../controllers/customField.controller';

const customFieldController = container.get<CustomFieldController>(CustomFieldController);

const customFieldsRouter = Router();

customFieldsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await customFieldController.createCustomField(req, res);
  } catch (error) {
    next(error);
  }
});

customFieldsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await customFieldController.getCustomFields(req, res);
  } catch (error) {
    next(error);
  }
});

customFieldsRouter.get('/:customFieldId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await customFieldController.getCustomFieldById(req, res);
  } catch (error) {
    next(error);
  }
});

export { customFieldsRouter };
