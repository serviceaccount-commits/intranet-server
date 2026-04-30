import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import {
  IArticleChunkRepository,
  ChunkToPersist,
  ChunkSearchResult,
} from '../interfaces/articles/articleChunk.repository.interface';
import { KbArticleChunk } from '../database/kb-domain.types';
import { getArticleChunksCollection } from '../database/kb-collections';
import { getMongoDb } from '../../../../shared/database/mongo-connection';

@injectable()
export class ArticleChunkRepository implements IArticleChunkRepository {
  private get col() {
    return getArticleChunksCollection(getMongoDb());
  }

  async replaceChunksForVersion(
    articleId: ObjectId,
    versionId: ObjectId,
    chunks: ChunkToPersist[],
  ): Promise<void> {
    await this.col.deleteMany({ version_id: versionId });

    if (chunks.length === 0) return;

    const now = new Date();
    const docs: KbArticleChunk[] = chunks.map((c) => ({
      _id: new ObjectId(),
      article_id: articleId,
      version_id: versionId,
      chunk_index: c.chunk_index,
      content: c.content,
      content_hash: c.content_hash,
      token_count: c.token_count,
      embedding: c.embedding,
      embedding_model: c.embedding_model,
      createdAt: now,
      updatedAt: now,
    }));

    await this.col.insertMany(docs);
  }

  async findByContentHashes(hashes: string[]): Promise<KbArticleChunk[]> {
    if (hashes.length === 0) return [];
    return this.col.find({ content_hash: { $in: hashes } }).toArray();
  }

  async findByVersionId(versionId: ObjectId): Promise<KbArticleChunk[]> {
    return this.col
      .find({ version_id: versionId })
      .sort({ chunk_index: 1 })
      .toArray();
  }

  async loadAllForSearch(): Promise<ChunkSearchResult[]> {
    const docs = await this.col
      .find({}, { projection: { content: 1, embedding: 1, article_id: 1, version_id: 1, chunk_index: 1 } })
      .toArray();
    return docs.map((d) => ({
      _id: d._id.toString(),
      article_id: d.article_id.toString(),
      version_id: d.version_id.toString(),
      chunk_index: d.chunk_index,
      content: d.content,
      embedding: d.embedding,
    }));
  }

  async deleteByVersionId(versionId: ObjectId): Promise<number> {
    const result = await this.col.deleteMany({ version_id: versionId });
    return result.deletedCount;
  }

  async deleteByArticleId(articleId: ObjectId): Promise<number> {
    const result = await this.col.deleteMany({ article_id: articleId });
    return result.deletedCount;
  }
}
