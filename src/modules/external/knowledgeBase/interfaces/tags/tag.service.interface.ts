import { KbTag } from '../../database/kb-domain.types';

export interface ITagService {
  createTag(tagName: string): Promise<KbTag>;
  getTags(): Promise<KbTag[]>;
  getTagById(tagId: string): Promise<KbTag>;
}
