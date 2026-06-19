import { ObjectId } from 'mongodb';
import { KbArticleChunk, ChunkAudience } from '../../database/kb-domain.types';

export interface ChunkToPersist {
  chunk_index: number;
  content: string;
  content_hash: string;
  token_count: number;
  embedding: number[];
  embedding_model: string;
}

export interface ChunkSearchResult {
  _id: string;
  article_id: string;
  version_id: string;
  chunk_index: number;
  content: string;
  embedding: number[];
  audience: ChunkAudience;
}

export interface IArticleChunkRepository {
  /** Replaces all chunks for a version with the provided set in a single
   *  delete+insert. The caller is responsible for deciding which chunks need
   *  fresh embeddings vs. reused ones (via findByContentHashes). */
  replaceChunksForVersion(
    articleId: ObjectId,
    versionId: ObjectId,
    chunks: ChunkToPersist[],
    audience?: ChunkAudience,
  ): Promise<void>;

  /** Looks up existing chunks by content_hash, used to reuse embeddings when
   *  unchanged content reappears. */
  findByContentHashes(hashes: string[]): Promise<KbArticleChunk[]>;

  /** Returns all chunks for a single version, ordered by chunk_index. */
  findByVersionId(versionId: ObjectId): Promise<KbArticleChunk[]>;

  /** Loads all chunks (embedding + identifying fields) for the in-memory
   *  cosine search cache. Excludes the heavy `content` field by default. */
  loadAllForSearch(): Promise<ChunkSearchResult[]>;

  /** Deletes all chunks for a version. Used when removing a version. */
  deleteByVersionId(versionId: ObjectId): Promise<number>;

  /** Deletes all chunks for an article. Used when removing an article. */
  deleteByArticleId(articleId: ObjectId): Promise<number>;
}
