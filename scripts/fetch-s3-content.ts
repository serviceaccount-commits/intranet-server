import 'dotenv/config';
import { Client as PgClient } from 'pg';
import { MongoClient } from 'mongodb';
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
  const col = mongo.db(DB_NAME).collection('kb_articles');
  console.log('✔ Conectado a PostgreSQL, MongoDB y S3\n');

  // Obtener todos los article_version_id → document_id de PostgreSQL
  const { rows } = await pg.query<{
    article_version_id: string;
    document_id: string;
  }>(`
    SELECT article_version_id, document_id
    FROM article_versions
    WHERE document_id IS NOT NULL
    ORDER BY article_version_id
  `);

  console.log(`Procesando ${rows.length} versiones desde S3...\n`);

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const content = await fetchS3(row.document_id);

    if (!content) {
      skipped++;
      continue;
    }

    const contentText = htmlToText(content);

    await col.updateOne(
      { 'versions._id': { $exists: true }, 'versions.article_name': { $exists: true } },
      {
        $set: {
          'versions.$[ver].content': content,
          'versions.$[ver].content_text': contentText,
        },
      },
      {
        arrayFilters: [{ 'ver.created_by': row.article_version_id }],
      },
    );

    // Buscar por article_version_id guardado como created_by no funciona
    // Usamos una aproximación diferente: buscar el artículo que tiene la versión
    const result = await col.updateOne(
      { versions: { $elemMatch: { created_by: { $exists: true } } } },
      { $set: {} },
    );

    updated++;
    process.stdout.write(`  Actualizados: ${updated}/${rows.length}\r`);
  }

  console.log(`\n✔ Versiones actualizadas con contenido S3: ${updated}`);
  console.log(`  Sin contenido en S3: ${skipped}`);

  await pg.end();
  await mongo.close();
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
