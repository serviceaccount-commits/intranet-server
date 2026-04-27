import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { ITagRepository } from '../interfaces/tags/tag.repository.interface';
import { KbTag, CreateTagInput } from '../database/kb-domain.types';
import { getTagsCollection } from '../database/kb-collections';
import { getMongoDb } from '../../../../shared/database/mongo-connection';

@injectable()
export class TagRepository implements ITagRepository {
  private get col() {
    return getTagsCollection(getMongoDb());
  }

  async create(input: CreateTagInput): Promise<KbTag> {
    const now = new Date();
    const doc: KbTag = {
      _id: new ObjectId(),
      tag_name: input.tag_name.trim(),
      createdAt: now,
      updatedAt: now,
    };
    await this.col.insertOne(doc);
    return doc;
  }

  async findAll(): Promise<KbTag[]> {
    return this.col.find({}).sort({ tag_name: 1 }).toArray();
  }

  async findById(id: string): Promise<KbTag | null> {
    if (!ObjectId.isValid(id)) return null;
    return this.col.findOne({ _id: new ObjectId(id) });
  }

  async findByIds(ids: string[]): Promise<KbTag[]> {
    const oids = ids
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));
    if (oids.length === 0) return [];
    return this.col.find({ _id: { $in: oids } }).toArray();
  }

  async findByName(name: string): Promise<KbTag | null> {
    return this.col.findOne(
      { tag_name: name },
      { collation: { locale: 'en', strength: 2 } },
    );
  }
}
