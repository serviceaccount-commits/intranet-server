import { KbTag, CreateTagInput } from '../../database/kb-domain.types';

export interface ITagRepository {
  create(input: CreateTagInput): Promise<KbTag>;
  findAll(): Promise<KbTag[]>;
  findById(id: string): Promise<KbTag | null>;
  findByIds(ids: string[]): Promise<KbTag[]>;
  findByName(name: string): Promise<KbTag | null>;
}
