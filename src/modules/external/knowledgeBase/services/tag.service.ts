import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { ITagService } from '../interfaces/tags/tag.service.interface';
import { ITagRepository } from '../interfaces/tags/tag.repository.interface';
import { KbTag } from '../database/kb-domain.types';
import { ConflictError } from '../../../../shared/errors/ConflictError';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

@injectable()
export class TagService implements ITagService {
  constructor(
    @inject(TYPES.ITagRepository)
    private tagRepository: ITagRepository,
  ) {}

  async createTag(tagName: string): Promise<KbTag> {
    const existing = await this.tagRepository.findByName(tagName);
    if (existing) {
      throw new ConflictError(`Tag "${tagName}" already exists.`);
    }
    return this.tagRepository.create({ tag_name: tagName });
  }

  async getTags(): Promise<KbTag[]> {
    return this.tagRepository.findAll();
  }

  async getTagById(tagId: string): Promise<KbTag> {
    const tag = await this.tagRepository.findById(tagId);
    if (!tag) throw new NotFoundError('Tag', tagId);
    return tag;
  }
}
