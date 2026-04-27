/**
 * Migration script: PostgreSQL KB articles → MongoDB
 *
 * Run with:
 *   npx ts-node --project tsconfig.json scripts/migrate-kb-to-mongo.ts
 */

import 'dotenv/config';
import { Client as PgClient } from 'pg';
import { MongoClient, ObjectId } from 'mongodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

// ─── Config ───────────────────────────────────────────────────────────────────

const env = process.env as Record<string, string>;

const pg = new PgClient({
  host: env['DATABASE_HOST'] ?? 'localhost',
  port: Number(env['DATABASE_PORT'] ?? 5432),
  user: env['DATABASE_USERNAME'],
  password: env['DATABASE_PASSWORD'],
  database: env['DATABASE_NAME'],
});

const mongo = new MongoClient(env['MONGODB_URI'] ?? 'mongodb://localhost:27017');
const DB_NAME = env['MONGODB_DB_NAME'] ?? 'paricus_kb';

const s3 = new S3Client({ region: env['AWS_REGION'] ?? 'us-east-2' });
const BUCKET = env['S3_BUCKET_NAME'] ?? 'paricus-api-intranet-uploads-2025';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchS3Content(documentId: string): Promise<string> {
  const key = `articles/${documentId}.txt`;
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    return (await res.Body?.transformToString('utf-8')) ?? '';
  } catch {
    console.warn(`  ⚠ S3 miss: ${key} — content set to empty`);
    return '';
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  await pg.connect();
  await mongo.connect();
  const db = mongo.db(DB_NAME);

  console.log('✔ Connected to PostgreSQL and MongoDB\n');

  // ── 1. Tags ────────────────────────────────────────────────────────────────

  const tagsResult = await pg.query<{
    tag_id: number;
    tag_name: string;
  }>('SELECT tag_id, tag_name FROM tags ORDER BY tag_id');

  const tagIdMap = new Map<number, ObjectId>(); // old int id → new ObjectId
  const tagsCol = db.collection('kb_tags');

  if (tagsResult.rows.length > 0) {
    // Drop collection (removes indexes too) to avoid duplicate key conflicts
    await tagsCol.drop().catch(() => { /* ignore if not exists */ });

    const now = new Date();
    const tagDocs = tagsResult.rows.map((t) => {
      const oid = new ObjectId();
      tagIdMap.set(t.tag_id, oid);
      return {
        _id: oid,
        tag_name: t.tag_name,
        createdAt: now,
        updatedAt: now,
      };
    });

    await tagsCol.insertMany(tagDocs);
    console.log(`✔ Tags migrated: ${tagDocs.length}`);
  } else {
    console.log('  No tags found in PostgreSQL');
  }

  // ── 2. Articles + versions ─────────────────────────────────────────────────

  const articlesResult = await pg.query<{
    article_id: string;
    user_id: string | null;
    topic_id: string;
    locked_by_user_id: string | null;
    lock_expires_at: Date | null;
    available_for_client: boolean;
    created_at: Date;
    updated_at: Date;
  }>(`
    SELECT
      article_id,
      user_id,
      topic_id,
      locked_by_user_id,
      lock_expires_at,
      available_for_client,
      "createdAt" AS created_at,
      "updatedAt" AS updated_at
    FROM articles
    ORDER BY "createdAt"
  `);

  const articlesCol = db.collection('kb_articles');
  await articlesCol.deleteMany({});

  let migratedArticles = 0;
  let migratedVersions = 0;

  for (const art of articlesResult.rows) {
    // Fetch all versions for this article
    const versionsResult = await pg.query<{
      article_version_id: string;
      article_name: string;
      article_synopsis: string;
      article_status: string;
      version: number;
      user_id: string | null;
      user_update_id: string | null;
      user_publish_id: string | null;
      document_id: string | null;
      published_at: Date | null;
      created_at: Date;
      updated_at: Date;
    }>(`
      SELECT
        article_version_id,
        article_name,
        COALESCE(article_synopsis, '') AS article_synopsis,
        article_status,
        version,
        user_id,
        user_update_id,
        user_publish_id,
        document_id,
        published_at,
        "createdAt" AS created_at,
        "updatedAt" AS updated_at
      FROM article_versions
      WHERE article_id = $1
      ORDER BY version ASC
    `, [art.article_id]);

    if (versionsResult.rows.length === 0) continue;

    const versions = [];

    for (const ver of versionsResult.rows) {
      // Fetch HTML from S3
      const content = ver.document_id
        ? await fetchS3Content(ver.document_id)
        : '';

      // Fetch tags for this version
      const tagsForVersion = await pg.query<{ tag_id: number }>(
        `SELECT tag_id FROM article_version_tags WHERE article_version_id = $1`,
        [ver.article_version_id],
      );

      const tagIds = tagsForVersion.rows
        .map((t) => tagIdMap.get(t.tag_id))
        .filter((oid): oid is ObjectId => oid !== undefined);

      // Map old status values
      let status = ver.article_status;
      if (status === 'archived') status = 'unpublished'; // normalize

      versions.push({
        _id: new ObjectId(),
        article_name: ver.article_name ?? '',
        article_synopsis: ver.article_synopsis ?? '',
        article_status: status,
        version: ver.version,
        content,
        content_storage: 'inline',
        tag_ids: tagIds,
        created_by: ver.user_id ?? null,
        updated_by: ver.user_update_id ?? null,
        published_by: ver.user_publish_id ?? null,
        published_at: ver.published_at ?? null,
        createdAt: ver.created_at ?? new Date(),
        updatedAt: ver.updated_at ?? new Date(),
      });

      migratedVersions++;
      process.stdout.write(`  → version ${ver.version} of article ${art.article_id.slice(0, 8)}...\r`);
    }

    await articlesCol.insertOne({
      _id: new ObjectId(),
      topic_id: art.topic_id,
      user_id: art.user_id ?? null,
      locked_by_user_id: null,
      lock_expires_at: null,
      available_for_client: art.available_for_client ?? false,
      versions,
      createdAt: art.created_at ?? new Date(),
      updatedAt: art.updated_at ?? new Date(),
    });

    migratedArticles++;
  }

  console.log(`\n✔ Articles migrated: ${migratedArticles}`);
  console.log(`✔ Versions migrated: ${migratedVersions}`);

  await pg.end();
  await mongo.close();
  console.log('\n✅ Migration complete');
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
