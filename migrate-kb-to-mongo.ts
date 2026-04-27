/**
 * KB Migration: PostgreSQL + S3 → MongoDB
 *
 * Run with:
 *   npx ts-node migrate-kb-to-mongo.ts
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { MongoClient, ObjectId } from 'mongodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

// ─── Config ───────────────────────────────────────────────────────────────────

const pgPool = new Pool({
  host: process.env['DATABASE_HOST'] ?? 'localhost',
  port: Number(process.env['DATABASE_PORT'] ?? 5432),
  database: process.env['DATABASE_NAME'] ?? 'paricus_prod_local',
  user: process.env['DATABASE_USERNAME'],
  password: process.env['DATABASE_PASSWORD'],
});

const mongoClient = new MongoClient(process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017');
const DB_NAME = process.env['MONGODB_DB_NAME'] ?? 'paricus_intranet';

const s3 = new S3Client({ region: process.env['AWS_REGION'] ?? 'us-east-2' });
const BUCKET = process.env['S3_BUCKET_NAME'] ?? 'paricus-api-intranet-uploads-2025';

// ─── S3 helper ────────────────────────────────────────────────────────────────

async function fetchFromS3(documentId: string): Promise<string> {
  const key = `articles/${documentId}.txt`;
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    return (await res.Body?.transformToString('utf-8')) ?? '';
  } catch {
    console.warn(`  ⚠️  S3 miss: ${key} — storing empty content`);
    return '';
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to PostgreSQL and MongoDB…');
  await mongoClient.connect();
  const db = mongoClient.db(DB_NAME);

  const tagsCol = db.collection('kb_tags');
  const articlesCol = db.collection('kb_articles');

  // ── 1. Migrate tags ─────────────────────────────────────────────────────────

  console.log('\n[1/3] Migrating tags…');
  const { rows: pgTags } = await pgPool.query<{
    tag_id: number;
    tag_name: string;
  }>('SELECT tag_id, tag_name FROM tags ORDER BY tag_id');

  // Map: old postgres int tag_id → new MongoDB ObjectId
  const tagIdMap = new Map<number, ObjectId>();

  let tagInserted = 0;
  let tagSkipped = 0;

  for (const pgTag of pgTags) {
    const existing = await tagsCol.findOne(
      { tag_name: pgTag.tag_name },
      { collation: { locale: 'en', strength: 2 } },
    );

    if (existing) {
      tagIdMap.set(pgTag.tag_id, existing._id as ObjectId);
      tagSkipped++;
    } else {
      const now = new Date();
      const result = await tagsCol.insertOne({
        tag_name: pgTag.tag_name,
        createdAt: now,
        updatedAt: now,
      });
      tagIdMap.set(pgTag.tag_id, result.insertedId);
      tagInserted++;
    }
  }

  console.log(`  ✅ Tags: ${tagInserted} inserted, ${tagSkipped} already existed`);

  // ── 2. Load all article versions from PostgreSQL ─────────────────────────────

  console.log('\n[2/3] Loading articles from PostgreSQL…');

  const { rows: pgArticles } = await pgPool.query<{
    article_id: string;
    user_id: string | null;
    topic_id: string | null;
    available_for_client: boolean;
    locked_by_user_id: string | null;
    lock_expires_at: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>(
    `SELECT article_id, user_id, topic_id, available_for_client,
            locked_by_user_id, lock_expires_at, "createdAt", "updatedAt"
     FROM articles
     ORDER BY "createdAt"`,
  );

  const { rows: pgVersions } = await pgPool.query<{
    article_version_id: string;
    article_id: string;
    article_name: string;
    article_synopsis: string;
    article_status: string;
    version: number;
    document_id: string | null;
    user_id: string | null;
    user_update_id: string | null;
    user_publish_id: string | null;
    published_at: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>(
    `SELECT article_version_id, article_id, article_name, article_synopsis,
            article_status, version, document_id,
            user_id, user_update_id, user_publish_id, published_at,
            "createdAt", "updatedAt"
     FROM article_versions
     ORDER BY article_id, version`,
  );

  // Load tag assignments
  const { rows: pgVersionTags } = await pgPool.query<{
    article_version_id: string;
    tag_id: number;
  }>('SELECT article_version_id, tag_id FROM article_version_tags');

  const versionTagsMap = new Map<string, number[]>();
  for (const row of pgVersionTags) {
    const list = versionTagsMap.get(row.article_version_id) ?? [];
    list.push(row.tag_id);
    versionTagsMap.set(row.article_version_id, list);
  }

  // Group versions by article_id
  const versionsByArticle = new Map<string, typeof pgVersions>();
  for (const v of pgVersions) {
    const list = versionsByArticle.get(v.article_id) ?? [];
    list.push(v);
    versionsByArticle.set(v.article_id, list);
  }

  // ── 3. Insert articles into MongoDB ─────────────────────────────────────────

  console.log('\n[3/3] Inserting articles into MongoDB…');
  let articleInserted = 0;
  let articleSkipped = 0;
  let versionCount = 0;

  for (const pgArticle of pgArticles) {
    if (!pgArticle.topic_id) {
      console.warn(`  ⚠️  Article ${pgArticle.article_id} has no topic_id — skipping`);
      continue;
    }

    // Check if already migrated (idempotent — keyed by postgres article_id stored in a field)
    const existing = await articlesCol.findOne({ _pg_article_id: pgArticle.article_id });
    if (existing) {
      articleSkipped++;
      continue;
    }

    const versions = versionsByArticle.get(pgArticle.article_id) ?? [];

    const mongoVersions = [];

    for (const v of versions) {
      // Fetch content from S3
      let content = '';
      if (v.document_id) {
        process.stdout.write(`  Fetching S3 content for version ${v.article_version_id}…`);
        content = await fetchFromS3(v.document_id);
        process.stdout.write(' done\n');
      }

      const pgTagIds = versionTagsMap.get(v.article_version_id) ?? [];
      const mongoTagIds = pgTagIds
        .map((id) => tagIdMap.get(id))
        .filter((id): id is ObjectId => id !== undefined);

      mongoVersions.push({
        _id: new ObjectId(),
        _pg_version_id: v.article_version_id, // kept for reference
        article_name: v.article_name,
        article_synopsis: v.article_synopsis ?? '',
        article_status: v.article_status as 'draft' | 'published' | 'unpublished',
        version: v.version,
        content,
        content_storage: 'inline' as const,
        tag_ids: mongoTagIds,
        created_by: v.user_id ?? null,
        updated_by: v.user_update_id ?? null,
        published_by: v.user_publish_id ?? null,
        published_at: v.published_at ?? null,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      });

      versionCount++;
    }

    await articlesCol.insertOne({
      _pg_article_id: pgArticle.article_id, // idempotency key
      topic_id: pgArticle.topic_id,
      user_id: pgArticle.user_id ?? null,
      locked_by_user_id: null,
      lock_expires_at: null,
      available_for_client: pgArticle.available_for_client ?? false,
      versions: mongoVersions,
      createdAt: pgArticle.createdAt,
      updatedAt: pgArticle.updatedAt,
    });

    articleInserted++;
    console.log(
      `  ✅ Article "${versions[0]?.article_name ?? pgArticle.article_id}" (${versions.length} versions)`,
    );
  }

  console.log(`
═══════════════════════════════════════════════════
Migration complete!
  Tags:     inserted=${tagInserted}, skipped=${tagSkipped}
  Articles: inserted=${articleInserted}, skipped=${articleSkipped}
  Versions: ${versionCount} total
═══════════════════════════════════════════════════`);

  await mongoClient.close();
  await pgPool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
