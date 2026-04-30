import { Db, Collection } from 'mongodb';
import type { KbTag, KbArticle, KbArticleChunk } from './kb-domain.types';

// ─── Collection names ─────────────────────────────────────────────────────────

export const KB_COLLECTIONS = {
  TAGS: 'kb_tags',
  ARTICLES: 'kb_articles',
  ARTICLE_CHUNKS: 'kb_article_chunks',
} as const;

// ─── Typed collection accessors ───────────────────────────────────────────────

export function getTagsCollection(db: Db): Collection<KbTag> {
  return db.collection<KbTag>(KB_COLLECTIONS.TAGS);
}

export function getArticlesCollection(db: Db): Collection<KbArticle> {
  return db.collection<KbArticle>(KB_COLLECTIONS.ARTICLES);
}

export function getArticleChunksCollection(db: Db): Collection<KbArticleChunk> {
  return db.collection<KbArticleChunk>(KB_COLLECTIONS.ARTICLE_CHUNKS);
}

// ─── Index setup ──────────────────────────────────────────────────────────────

export async function setupKbCollections(db: Db): Promise<void> {
  await Promise.all([
    setupTagIndexes(db),
    setupArticleIndexes(db),
    setupArticleChunkIndexes(db),
  ]);

}

// ─── Tag indexes ──────────────────────────────────────────────────────────────

async function setupTagIndexes(db: Db): Promise<void> {
  const col = getTagsCollection(db);

  await col.createIndexes([
    {
      key: { tag_name: 1 },
      name: 'tag_name_unique',
      unique: true,
      collation: { locale: 'en', strength: 2 },
    },
  ]);
}

// ─── Article indexes ──────────────────────────────────────────────────────────

async function setupArticleIndexes(db: Db): Promise<void> {
  const col = getArticlesCollection(db);

  await col.createIndexes([
    {
      key: { topic_id: 1, updatedAt: -1 },
      name: 'article_topic_updated',
    },
    {
      key: { topic_id: 1, available_for_client: 1 },
      name: 'article_topic_available',
    },
    {
      key: { 'versions._id': 1 },
      name: 'article_version_id',
    },
    {
      key: { 'versions.article_name': 'text', 'versions.article_synopsis': 'text', 'versions.content_text': 'text' },
      name: 'article_text_search',
      weights: {
        'versions.article_name': 10,
        'versions.article_synopsis': 5,
        'versions.content_text': 1,
      },
    },
    {
      key: { lock_expires_at: 1 },
      name: 'article_lock_expiry',
      sparse: true,
    },
    {
      key: { 'versions.tag_ids': 1 },
      name: 'article_version_tags',
    },
    {
      key: { topic_id: 1, 'versions.article_status': 1 },
      name: 'article_topic_status',
    },
    {
      key: { topic_id: 1, 'versions.article_status': 1, updatedAt: -1 },
      name: 'article_topic_status_recent',
    },
  ]);
}

// ─── Article chunk indexes ────────────────────────────────────────────────────

async function setupArticleChunkIndexes(db: Db): Promise<void> {
  const col = getArticleChunksCollection(db);

  await col.createIndexes([
    {
      key: { version_id: 1, chunk_index: 1 },
      name: 'chunk_version_order',
    },
    {
      key: { article_id: 1 },
      name: 'chunk_article_id',
    },
    {
      key: { content_hash: 1 },
      name: 'chunk_content_hash',
    },
  ]);
}
