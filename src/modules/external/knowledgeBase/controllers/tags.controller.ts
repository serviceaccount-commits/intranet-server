import { Request, Response } from 'express';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { ITagService } from '../interfaces/tags/tag.service.interface';

@injectable()
export class TagController {
  constructor(@inject(TYPES.ITagService) private tagService: ITagService) {}

  async createTag(req: Request, res: Response) {
    let { tagName } = req.body;

    const tag = await this.tagService.createTag(tagName);

    return res.json(tag);
  }

  async getTags(_req: Request, res: Response) {
    const tags = await this.tagService.getTags();

    return res.json(tags);
  }

  async getTagById(req: Request, res: Response) {
    const { tagId } = req.params;

    if (!tagId) {
      res.sendStatus(400);
      return;
    }

    const tag = await this.tagService.getTagById(tagId);

    return res.json(tag);
  }
}
