import 'dotenv/config';
import { Client as PgClient } from 'pg';
import { MongoClient, ObjectId } from 'mongodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import * as cheerio from 'cheerio';

const pg = new PgClient({
  host: process.env['DATABASE_HOST'] ?? 'localhost',
  port: Number(process.env['DATABASE_PORT'] ?? 5432),
  user: process.env['DATABASE_USERNAME'],
  password: process.env['DATABASE_PASSWORD'],
  database: process.env['DATABASE_NAME'],
});

const mongo = new MongoClient(process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017');
const DB_NAME = process.env['MONGODB_DB_NAME'] ?? 'paricus_kb';

const s3 = new S3Client({ region: process.env['AWS_REGION'] ?? 'us-east-2' });
const BUCKET = process.env['S3_BUCKET_NAME'] ?? 'paricus-api-intranet-uploads-2025';

function htmlToText(html: string): string {
  const $ = cheerio.load(html);
  return $.root().text().replace(/\s+/g, ' ').trim();
}

async function fetchS3(documentId: string): Promise<string> {
  try {
    const res = await s3.send(new GetObjectCommand({
      Bucket: BUCKET,
      Key: `articles/${documentId}.txt`,
    }));
    return (await res.Body?.transformToString('utf-8')) ?? '';
  } catch {
    return '';
  }
}

async function run() {
  await pg.connect();
  await mongo.connect();
  const db = mongo.db(DB_NAME);
  console.log('✔ Conectado a PostgreSQL, MongoDB y S3\n');

  // ── 1. Tags ─────────────────────────────────────────────────────────────────

  const { rows: tagRows } = await pg.query<{ tag_id: number; tag_name: string }>(
    'SELECT tag_id, tag_name FROM tags ORDER BY tag_id',
  );

  const tagsCol = db.collection('kb_tags');
  await tagsCol.drop().catch(() => {});

  const tagIdMap = new Map<number, ObjectId>();
  if (tagRows.length > 0) {
    const now = new Date();
    const seenNames = new Map<string, ObjectId>();
    const tagDocs = [];
    for (const t of tagRows) {
      const key = t.tag_name.toLowerCase().trim();
      if (seenNames.has(key)) {
        tagIdMap.set(t.tag_id, seenNames.get(key)!);
      } else {
        const oid = new ObjectId();
        seenNames.set(key, oid);
        tagIdMap.set(t.tag_id, oid);
        tagDocs.push({ _id: oid, tag_name: t.tag_name, createdAt: now, updatedAt: now });
      }
    }
    await tagsCol.insertMany(tagDocs);
    console.log(`✔ Tags: ${tagDocs.length} (${tagRows.length - tagDocs.length} duplicados eliminados)`);
  }

  // ── 2. Tags por versión ──────────────────────────────────────────────────────

  const { rows: versionTagRows } = await pg.query<{
    article_version_id: string;
    tag_id: number;
  }>('SELECT article_version_id, tag_id FROM article_version_tags');

  const tagsByVersion = new Map<string, ObjectId[]>();
  for (const row of versionTagRows) {
    const oid = tagIdMap.get(row.tag_id);
    if (!oid) continue;
    const list = tagsByVersion.get(row.article_version_id) ?? [];
    list.push(oid);
    tagsByVersion.set(row.article_version_id, list);
  }

  // ── 3. Artículos ─────────────────────────────────────────────────────────────

  const { rows: articleRows } = await pg.query<{
    article_id: string;
    user_id: string | null;
    topic_id: string;
    available_for_client: boolean;
    created_at: Date;
    updated_at: Date;
  }>(`
    SELECT article_id, user_id, topic_id, available_for_client,
           "createdAt" AS created_at, "updatedAt" AS updated_at
    FROM articles ORDER BY "createdAt"
  `);

  const articlesCol = db.collection('kb_articles');
  await articlesCol.deleteMany({});

  let totalArticles = 0;
  let totalVersions = 0;
  let totalWithContent = 0;

  for (const art of articleRows) {
    const { rows: verRows } = await pg.query<{
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
      SELECT article_version_id, article_name,
             COALESCE(article_synopsis, '') AS article_synopsis,
             article_status, version, user_id, user_update_id,
             user_publish_id, document_id, published_at,
             "createdAt" AS created_at, "updatedAt" AS updated_at
      FROM article_versions
      WHERE article_id = $1 ORDER BY version ASC
    `, [art.article_id]);

    if (verRows.length === 0) continue;

    const versions = [];
    for (const ver of verRows) {
      const content = ver.document_id ? await fetchS3(ver.document_id) : '';
      const contentText = content ? htmlToText(content) : '';
      if (content) totalWithContent++;

      versions.push({
        _id: new ObjectId(),
        article_name: ver.article_name ?? '',
        article_synopsis: ver.article_synopsis ?? '',
        article_status: ver.article_status,
        version: ver.version,
        content,
        content_text: contentText,
        content_storage: 'inline',
        tag_ids: tagsByVersion.get(ver.article_version_id) ?? [],
        created_by: ver.user_id ?? null,
        updated_by: ver.user_update_id ?? null,
        updated_by_name: null,
        published_by: ver.user_publish_id ?? null,
        published_at: ver.published_at ?? null,
        createdAt: ver.created_at ?? new Date(),
        updatedAt: ver.updated_at ?? new Date(),
      });

      totalVersions++;
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

    totalArticles++;
    process.stdout.write(`  Artículos: ${totalArticles}/${articleRows.length}\r`);
  }

  console.log(`\n✔ Artículos migrados:  ${totalArticles}`);
  console.log(`✔ Versiones migradas:  ${totalVersions}`);
  console.log(`✔ Con contenido S3:    ${totalWithContent}`);
  console.log(`  Sin contenido:       ${totalVersions - totalWithContent}`);

  await pg.end();
  await mongo.close();
  console.log('\n✅ Migración completada exitosamente');
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
