import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { TYPES } from '../../../../shared/config/containerTypes';
import { IArticleChunkRepository, ChunkToPersist } from '../interfaces/articles/articleChunk.repository.interface';
import { chunkHtmlContent } from '../../../../shared/utils/chunker';
import { getEmbedding, EMBEDDING_MODEL } from '../../../../shared/utils/ai.service';
import { logger } from '../../../../shared/utils/logger';
import { ArticleSearchService } from './articleSearch.service';

export interface ProcessVersionResult {
  chunksCreated: number;
  reusedFromCache: number;
  newlyEmbedded: number;
}

@injectable()
export class ArticleChunkingService {
  constructor(
    @inject(TYPES.IArticleChunkRepository)
    private chunkRepository: IArticleChunkRepository,
    @inject(TYPES.IArticleSearchService)
    private searchService: ArticleSearchService,
  ) {}

  /** Re-chunks the given HTML for a version, reusing embeddings whose
   *  content_hash already exists (either on this version or anywhere in the
   *  chunks collection). Embeds only what is genuinely new. */
  async processVersion(
    articleId: string,
    versionId: string,
    html: string,
  ): Promise<ProcessVersionResult> {
    const articleOid = new ObjectId(articleId);
    const versionOid = new ObjectId(versionId);

    const cleaned = (html ?? '').trim();
    if (!cleaned) {
      const removed = await this.chunkRepository.deleteByVersionId(versionOid);
      return { chunksCreated: 0, reusedFromCache: removed, newlyEmbedded: 0 };
    }

    const chunks = chunkHtmlContent(cleaned);
    if (chunks.length === 0) {
      const removed = await this.chunkRepository.deleteByVersionId(versionOid);
      return { chunksCreated: 0, reusedFromCache: removed, newlyEmbedded: 0 };
    }

    const hashes = chunks.map((c) => c.content_hash);
    const cached = await this.chunkRepository.findByContentHashes(hashes);

    const hashToEmbedding = new Map<string, number[]>();
    for (const c of cached) {
      if (c.embedding_model === EMBEDDING_MODEL && !hashToEmbedding.has(c.content_hash)) {
        hashToEmbedding.set(c.content_hash, c.embedding);
      }
    }

    let reused = 0;
    let embedded = 0;
    const toPersist: ChunkToPersist[] = [];

    for (const chunk of chunks) {
      let embedding = hashToEmbedding.get(chunk.content_hash);
      if (embedding) {
        reused++;
      } else {
        embedding = await getEmbedding(chunk.content, 'document');
        hashToEmbedding.set(chunk.content_hash, embedding);
        embedded++;
      }
      toPersist.push({
        chunk_index: chunk.chunk_index,
        content: chunk.content,
        content_hash: chunk.content_hash,
        token_count: chunk.token_count,
        embedding,
        embedding_model: EMBEDDING_MODEL,
      });
    }

    await this.chunkRepository.replaceChunksForVersion(articleOid, versionOid, toPersist);
    this.searchService.invalidateCache();

    return {
      chunksCreated: toPersist.length,
      reusedFromCache: reused,
      newlyEmbedded: embedded,
    };
  }

  /** Wrapper for consumers (article create/update flows) that should never
   *  fail the parent operation if chunking fails. Errors are logged. */
  async processVersionSafe(articleId: string, versionId: string, html: string): Promise<void> {
    try {
      const result = await this.processVersion(articleId, versionId, html);
      logger.info(
        `[chunking] version=${versionId} chunks=${result.chunksCreated} reused=${result.reusedFromCache} embedded=${result.newlyEmbedded}`,
      );
    } catch (error) {
      logger.error(`[chunking] failed for version=${versionId}`, error);
    }
  }
}
