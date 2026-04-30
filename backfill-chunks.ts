/**
 * Backfill: generate chunks + embeddings for every existing article version.
 * Reuses embeddings via content_hash (so re-running is cheap and idempotent).
 *
 * Run with:
 *   npx ts-node backfill-chunks.ts            # all versions
 *   npx ts-node backfill-chunks.ts --published-only
 *   npx ts-node backfill-chunks.ts --version <versionId>
 */

import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import { chunkHtmlContent } from './src/shared/utils/chunker';
import { getEmbedding, EMBEDDING_MODEL } from './src/shared/utils/ai.service';

const MONGO_URI = process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017';
const DB_NAME = process.env['MONGODB_DB_NAME'] ?? 'paricus_intranet';
const ARTICLES = 'kb_articles';
const CHUNKS = 'kb_article_chunks';

interface VersionDoc {
  _id: ObjectId;
  article_name: string;
  article_status: string;
  content?: string;
}

interface ArticleDoc {
  _id: ObjectId;
  versions: VersionDoc[];
}

async function processOneVersion(
  db: ReturnType<MongoClient['db']>,
  articleId: ObjectId,
  version: VersionDoc,
  hashCache: Map<string, number[]>,
): Promise<{ chunks: number; reused: number; embedded: number }> {
  const html = (version.content ?? '').trim();
  if (!html) {
    await db.collection(CHUNKS).deleteMany({ version_id: version._id });
    return { chunks: 0, reused: 0, embedded: 0 };
  }

  const chunks = chunkHtmlContent(html);
  if (chunks.length === 0) {
    await db.collection(CHUNKS).deleteMany({ version_id: version._id });
    return { chunks: 0, reused: 0, embedded: 0 };
  }

  // Pull any existing chunks (this version OR globally) keyed by hash.
  const dbHits = await db
    .collection(CHUNKS)
    .find(
      { content_hash: { $in: chunks.map((c) => c.content_hash) }, embedding_model: EMBEDDING_MODEL },
      { projection: { content_hash: 1, embedding: 1 } },
    )
    .toArray();
  for (const h of dbHits) {
    if (!hashCache.has(h['content_hash'] as string)) {
      hashCache.set(h['content_hash'] as string, h['embedding'] as number[]);
    }
  }

  let reused = 0;
  let embedded = 0;
  const now = new Date();
  const docs = [];

  for (const chunk of chunks) {
    let embedding = hashCache.get(chunk.content_hash);
    if (embedding) {
      reused++;
    } else {
      embedding = await getEmbedding(chunk.content, 'document');
      hashCache.set(chunk.content_hash, embedding);
      embedded++;
    }
    docs.push({
      _id: new ObjectId(),
      article_id: articleId,
      version_id: version._id,
      chunk_index: chunk.chunk_index,
      content: chunk.content,
      content_hash: chunk.content_hash,
      token_count: chunk.token_count,
      embedding,
      embedding_model: EMBEDDING_MODEL,
      createdAt: now,
      updatedAt: now,
    });
  }

  await db.collection(CHUNKS).deleteMany({ version_id: version._id });
  if (docs.length > 0) {
    await db.collection(CHUNKS).insertMany(docs);
  }

  return { chunks: docs.length, reused, embedded };
}

async function main() {
  const args = process.argv.slice(2);
  const publishedOnly = args.includes('--published-only');
  const versionFlagIdx = args.indexOf('--version');
  const onlyVersionId = versionFlagIdx >= 0 ? args[versionFlagIdx + 1] : null;

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log(`Connected to ${DB_NAME}.`);
  console.log(`Mode: ${onlyVersionId ? 'single version' : publishedOnly ? 'published only' : 'all versions'}`);
  console.log(`Embedding model: ${EMBEDDING_MODEL}`);

  const articles = (await db
    .collection(ARTICLES)
    .find({}, { projection: { _id: 1, versions: 1 } })
    .toArray()) as unknown as ArticleDoc[];

  console.log(`Articles: ${articles.length}`);

  const hashCache = new Map<string, number[]>();
  let totals = { versionsProcessed: 0, chunks: 0, reused: 0, embedded: 0, skipped: 0 };
  const start = Date.now();

  for (const article of articles) {
    for (const version of article.versions) {
      if (onlyVersionId && version._id.toString() !== onlyVersionId) {
        totals.skipped++;
        continue;
      }
      if (publishedOnly && version.article_status !== 'published') {
        totals.skipped++;
        continue;
      }

      const stats = await processOneVersion(db, article._id, version, hashCache);
      totals.versionsProcessed++;
      totals.chunks += stats.chunks;
      totals.reused += stats.reused;
      totals.embedded += stats.embedded;
      const tag = `${article._id.toString()}/${version._id.toString()}`;
      console.log(
        `  ✓ ${tag} [${version.article_status}] chunks=${stats.chunks} reused=${stats.reused} embedded=${stats.embedded}`,
      );
    }
  }

  const elapsedMs = Date.now() - start;
  console.log('\n─── Summary ────────────────────────────────────────────');
  console.log(`Versions processed: ${totals.versionsProcessed}`);
  console.log(`Versions skipped:   ${totals.skipped}`);
  console.log(`Chunks written:     ${totals.chunks}`);
  console.log(`Embeddings reused:  ${totals.reused}`);
  console.log(`Embeddings new:     ${totals.embedded}`);
  console.log(`Elapsed:            ${(elapsedMs / 1000).toFixed(1)}s`);

  await client.close();
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
