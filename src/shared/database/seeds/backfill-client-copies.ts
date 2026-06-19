/**
 * One-off backfill for the dual-view feature.
 *
 *  1. For every article without a `client_copy`, seeds one from its latest
 *     published version (falling back to the highest-numbered version).
 *  2. Stamps `audience: 'internal'` on every chunk that predates the audience
 *     field, so internal search keeps working.
 *
 * It does NOT generate client-copy embeddings (that needs the Gemini pipeline).
 * After running this, hit the admin reindex endpoint
 * (`POST /api/v1/external/admin/articles/reindex`) to build the client chunks.
 *
 * Run with: ts-node src/shared/database/seeds/backfill-client-copies.ts
 */
import { ObjectId } from 'mongodb';
import * as cheerio from 'cheerio';

import appConfig from '../../config/appConfig';
import { connectMongoDB, disconnectMongoDB, getMongoDb } from '../mongo-connection';
import { KB_COLLECTIONS } from '../../../modules/external/knowledgeBase/database/kb-collections';
import type {
  KbArticle,
  KbArticleVersion,
  KbClientCopy,
} from '../../../modules/external/knowledgeBase/database/kb-domain.types';

function htmlToText(html: string): string {
  const $ = cheerio.load(html ?? '');
  return $.root().text().replace(/\s+/g, ' ').trim();
}

/** Latest published version, else the highest-numbered version. */
function pickSeedVersion(versions: KbArticleVersion[]): KbArticleVersion | null {
  if (!versions || versions.length === 0) return null;
  const published = versions.filter((v) => v.article_status === 'published');
  const pool = published.length > 0 ? published : versions;
  return pool.reduce((max, v) => (v.version > max.version ? v : max));
}

async function main() {
  await connectMongoDB(appConfig.mongodb.uri, appConfig.mongodb.dbName);
  const db = getMongoDb();
  const articles = db.collection<KbArticle>(KB_COLLECTIONS.ARTICLES);
  const chunks = db.collection(KB_COLLECTIONS.ARTICLE_CHUNKS);

  // 1. Seed client copies.
  const cursor = articles.find({ client_copy: { $in: [null, undefined] } });
  let seeded = 0;
  let skipped = 0;
  for await (const article of cursor) {
    const seed = pickSeedVersion(article.versions);
    if (!seed) {
      skipped++;
      continue;
    }
    const now = new Date();
    const clientCopy: KbClientCopy = {
      _id: new ObjectId(),
      article_name: seed.article_name,
      article_synopsis: seed.article_synopsis,
      content: seed.content,
      content_text: htmlToText(seed.content),
      content_storage: 'inline',
      updated_by: seed.updated_by ?? null,
      updated_by_name: seed.updated_by_name ?? null,
      seeded_from_version_id: seed._id,
      createdAt: now,
      updatedAt: now,
    };
    await articles.updateOne(
      { _id: article._id },
      { $set: { client_copy: clientCopy } },
    );
    seeded++;
  }

  // 2. Stamp audience on legacy chunks.
  const chunkRes = await chunks.updateMany(
    { audience: { $exists: false } },
    { $set: { audience: 'internal' } },
  );

  console.log(
    `Backfill done: client_copy seeded=${seeded} skipped(no versions)=${skipped}; ` +
      `chunks stamped internal=${chunkRes.modifiedCount}`,
  );
  console.log(
    'Next: POST /api/v1/external/admin/articles/reindex (admin key) to build client chunks.',
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectMongoDB();
  });
