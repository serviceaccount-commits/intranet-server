import 'reflect-metadata';
import { AppDataSource } from './src/shared/database/data-source';
import { ArticleChunk } from './src/modules/external/knowledgeBase/entities/ArticleChunk.entity';
import { ArticleVersion } from './src/modules/external/knowledgeBase/entities/ArticleVersion.entity';

async function verifyChunks() {
  try {
    await AppDataSource.initialize();

    console.log('Checking Article Versions and Chunks...');

    const versions = await AppDataSource.manager.find(ArticleVersion, {
      order: { updatedAt: 'DESC' },
      take: 10,
    });

    console.log(`Found ${versions.length} latest ArticleVersions.`);

    for (const v of versions) {
      const chunkCount = await AppDataSource.manager.count(ArticleChunk, {
        where: { article_version_id: v.article_version_id },
      });
      console.log(
        `ArticleVersion ${v.article_version_id} (${v.article_name}): ${chunkCount} chunks. Status: ${v.article_status}`,
      );
    }

    const totalChunks = await AppDataSource.manager.count(ArticleChunk);
    console.log(`Total chunks in DB: ${totalChunks}`);

    const chunks = await AppDataSource.manager.find(ArticleChunk, { take: 1 });
    if (chunks.length > 0) {
      console.log('Sample chunk embedding length:', chunks[0].content.length);
      // We can't easily see the embedding as it's binary or special type, but verifying existence is key.
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

verifyChunks();
