import { Request, Response } from 'express';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { ITagService } from '../interfaces/tags/tag.service.interface';
import { KbTag } from '../database/kb-domain.types';

// The client identifies tags by `tag_id` (as in article details); the Mongo
// document only has `_id`. Without it every add/remove/filter went out with
// an undefined id — the editor took any second tag for a duplicate and
// removals never reached the database.
const toTagResponse = (tag: KbTag) => ({ ...tag, tag_id: tag._id.toString() });

@injectable()
export class TagController {
  constructor(@inject(TYPES.ITagService) private tagService: ITagService) {}

  async createTag(req: Request, res: Response) {
    let { tagName } = req.body;

    const tag = await this.tagService.createTag(tagName);

    return res.json(toTagResponse(tag));
  }

  async getTags(_req: Request, res: Response) {
    const tags = await this.tagService.getTags();

    return res.json(tags.map(toTagResponse));
  }

  async getTagById(req: Request, res: Response) {
    const { tagId } = req.params;

    if (!tagId) {
      res.sendStatus(400);
      return;
    }

    const tag = await this.tagService.getTagById(tagId);

    return res.json(toTagResponse(tag));
  }
}
