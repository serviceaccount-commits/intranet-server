import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { OptionController } from '../controllers/options.controller';

const optionController = container.get<OptionController>(OptionController);
const optionsRouter = Router();

optionsRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await optionController.createOption(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

optionsRouter.put(
  '/:optionId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await optionController.updateOption(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

optionsRouter.delete(
  '/:optionId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await optionController.deleteOption(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export { optionsRouter };
