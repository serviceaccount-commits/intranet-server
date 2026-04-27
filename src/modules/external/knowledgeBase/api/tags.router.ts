import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { TagController } from '../controllers/tags.controller';

const tagController = container.get<TagController>(TagController);

const tagsRouter = Router();

tagsRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await tagController.createTag(req, res);
    } catch (error) {
      next(error);
    }
  },
);

tagsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await tagController.getTags(req, res);
  } catch (error) {
    next(error);
  }
});

tagsRouter.get(
  '/:tagId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await tagController.getTagById(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { tagsRouter };
