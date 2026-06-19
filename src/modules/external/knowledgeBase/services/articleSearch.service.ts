import { inject, injectable } from 'inversify';

import { TYPES } from '../../../../shared/config/containerTypes';
import { IArticleChunkRepository, ChunkSearchResult } from '../interfaces/articles/articleChunk.repository.interface';
import { IArticleRepository } from '../interfaces/articles/article.repository.interface';
import { getArticlesCollection } from '../database/kb-collections';
import { getMongoDb } from '../../../../shared/database/mongo-connection';
import { getEmbedding } from '../../../../shared/utils/ai.service';
import { logger } from '../../../../shared/utils/logger';
import {
  KbArticleVersionView,
  KbClientCopyView,
  ArticleStatus,
  ChunkAudience,
} from '../database/kb-domain.types';

export interface SearchHit {
  article: KbArticleVersionView;
  matched_chunk_preview: string | null;
  score: number;
  vector_rank: number | null;
  text_rank: number | null;
}

export interface SearchOptions {
  limit?: number;
  topicIds?: string[];
  statuses?: ArticleStatus[];
  /** Which corpus to search. 'internal' (default) = internal version chunks
   *  for the intranet; 'client' = client-copy chunks for external/portal. */
  audience?: ChunkAudience;
}

/** Adapts a client-copy view to the flat version-view shape the search hit and
 *  its consumers expect (article id = the client copy id). */
function clientCopyToHitView(c: KbClientCopyView): KbArticleVersionView {
  return {
    article_id: c.article_id,
    topic_id: c.topic_id,
    user_id: null,
    locked_by_user_id: null,
    lock_expires_at: null,
    available_for_client: c.available_for_client,
    article_version_id: c.client_copy_id,
    article_name: c.article_name,
    article_synopsis: c.article_synopsis,
    article_status: 'published',
    version: 1,
    content: c.content,
    content_storage: 'inline',
    tag_ids: [],
    created_by: null,
    updated_by: c.updated_by,
    updated_by_name: c.updated_by_name,
    published_by: null,
    published_at: null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

const RRF_K = 60;
const DEFAULT_LIMIT = 20;
const VECTOR_TOP_K = 50;
const TEXT_TOP_K = 50;
const PREVIEW_LENGTH = 280;

@injectable()
export class ArticleSearchService {
  // In-memory cache of all chunk embeddings. Refreshed lazily; safe to be
  // slightly stale because the persistence layer is the source of truth.
  private cache: ChunkSearchResult[] = [];
  private cacheLoadedAt: number | null = null;
  private cacheTtlMs = 5 * 60 * 1000;

  constructor(
    @inject(TYPES.IArticleChunkRepository)
    private chunkRepository: IArticleChunkRepository,
    @inject(TYPES.IArticleRepository)
    private articleRepository: IArticleRepository,
  ) {}

  invalidateCache(): void {
    this.cacheLoadedAt = null;
  }

  private async ensureCache(): Promise<void> {
    const fresh = this.cacheLoadedAt !== null && Date.now() - this.cacheLoadedAt < this.cacheTtlMs;
    if (fresh && this.cache.length > 0) return;
    this.cache = await this.chunkRepository.loadAllForSearch();
    this.cacheLoadedAt = Date.now();
    logger.info(`[search] chunk cache loaded: ${this.cache.length} chunks`);
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchHit[]> {
    const trimmed = (query ?? '').trim();
    if (!trimmed) return [];

    const limit = options.limit ?? DEFAULT_LIMIT;
    const allowedStatuses = options.statuses ?? ['published'];
    const audience = options.audience ?? 'internal';

    const [vectorRanking, textRanking] = await Promise.all([
      this.vectorSearch(trimmed, audience),
      // Text search runs over the articles collection's $text index, which
      // covers internal version content only. The client corpus is searched
      // by vectors alone.
      audience === 'internal' ? this.textSearch(trimmed) : Promise.resolve([]),
    ]);

    const fused = this.fuseRankings(vectorRanking, textRanking);
    if (fused.length === 0) return [];

    const ids = fused.map((f) => f.version_id);

    if (audience === 'client') {
      const copies = await this.articleRepository.findClientCopyViewsByCopyIds(ids);
      const byId = new Map(copies.map((c) => [c.client_copy_id, c]));

      const hits: SearchHit[] = [];
      for (const f of fused) {
        const copy = byId.get(f.version_id);
        if (!copy) continue;
        if (options.topicIds && options.topicIds.length > 0 && !options.topicIds.includes(copy.topic_id)) continue;

        hits.push({
          article: clientCopyToHitView(copy),
          matched_chunk_preview: f.preview,
          score: f.score,
          vector_rank: f.vector_rank,
          text_rank: f.text_rank,
        });
        if (hits.length >= limit) break;
      }
      return hits;
    }

    const articles = await this.articleRepository.findByVersionIds(ids);
    const articleByVersionId = new Map(articles.map((a) => [a.article_version_id, a]));

    const hits: SearchHit[] = [];
    for (const f of fused) {
      const article = articleByVersionId.get(f.version_id);
      if (!article) continue;
      if (!allowedStatuses.includes(article.article_status)) continue;
      if (options.topicIds && options.topicIds.length > 0 && !options.topicIds.includes(article.topic_id)) continue;

      hits.push({
        article,
        matched_chunk_preview: f.preview,
        score: f.score,
        vector_rank: f.vector_rank,
        text_rank: f.text_rank,
      });

      if (hits.length >= limit) break;
    }

    return hits;
  }

  // ─── Vector path ──────────────────────────────────────────────────────────────

  private async vectorSearch(
    query: string,
    audience: ChunkAudience = 'internal',
  ): Promise<Array<{ version_id: string; chunk_id: string; preview: string; similarity: number }>> {
    await this.ensureCache();
    if (this.cache.length === 0) return [];

    const queryEmbedding = await getEmbedding(query, 'query');

    const scored = this.cache
      .filter((c) => c.audience === audience)
      .map((c) => ({
        version_id: c.version_id,
        chunk_id: c._id,
        preview: c.content.slice(0, PREVIEW_LENGTH),
        similarity: cosineSimilarity(queryEmbedding, c.embedding),
      }));

    scored.sort((a, b) => b.similarity - a.similarity);

    // Collapse to best chunk per version_id, then take top K.
    const seen = new Set<string>();
    const best: typeof scored = [];
    for (const s of scored) {
      if (seen.has(s.version_id)) continue;
      seen.add(s.version_id);
      best.push(s);
      if (best.length >= VECTOR_TOP_K) break;
    }
    return best;
  }

  // ─── Text path ────────────────────────────────────────────────────────────────

  private async textSearch(query: string): Promise<Array<{ version_id: string }>> {
    const col = getArticlesCollection(getMongoDb());

    const docs = await col
      .aggregate([
        { $match: { $text: { $search: query } } },
        { $addFields: { textScore: { $meta: 'textScore' } } },
        { $unwind: '$versions' },
        { $sort: { textScore: -1, 'versions.updatedAt': -1 } },
        { $limit: TEXT_TOP_K },
        { $project: { _id: 0, version_id: { $toString: '$versions._id' } } },
      ])
      .toArray();

    return docs.map((d) => ({ version_id: d['version_id'] as string }));
  }

  // ─── RRF fusion ───────────────────────────────────────────────────────────────

  private fuseRankings(
    vec: Array<{ version_id: string; chunk_id: string; preview: string; similarity: number }>,
    text: Array<{ version_id: string }>,
  ): Array<{
    version_id: string;
    score: number;
    preview: string | null;
    vector_rank: number | null;
    text_rank: number | null;
  }> {
    const scores = new Map<string, {
      score: number;
      preview: string | null;
      vector_rank: number | null;
      text_rank: number | null;
    }>();

    vec.forEach((v, i) => {
      const rank = i + 1;
      scores.set(v.version_id, {
        score: 1 / (RRF_K + rank),
        preview: v.preview,
        vector_rank: rank,
        text_rank: null,
      });
    });

    text.forEach((t, i) => {
      const rank = i + 1;
      const existing = scores.get(t.version_id);
      if (existing) {
        existing.score += 1 / (RRF_K + rank);
        existing.text_rank = rank;
      } else {
        scores.set(t.version_id, {
          score: 1 / (RRF_K + rank),
          preview: null,
          vector_rank: null,
          text_rank: rank,
        });
      }
    });

    return Array.from(scores.entries())
      .map(([version_id, v]) => ({ version_id, ...v }))
      .sort((a, b) => b.score - a.score);
  }
}

// ─── Math ───────────────────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i]!;
    const bi = b[i]!;
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
