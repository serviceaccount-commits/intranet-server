import 'reflect-metadata';
import { container } from './src/shared/config/inversify.config';
import { AppDataSource } from './src/shared/database/data-source';
import { TYPES } from './src/shared/config/containerTypes';
import { IArticleRepository } from './src/modules/external/knowledgeBase/interfaces/articles/article.repository.interface';
import { Client } from './src/modules/external/knowledgeBase/entities/Client.entity';
import { Topic } from './src/modules/external/knowledgeBase/entities/Topic.entity';
import { Article } from './src/modules/external/knowledgeBase/entities/Article.entity';
import { ArticleVersion } from './src/modules/external/knowledgeBase/entities/ArticleVersion.entity';
import { User } from './src/modules/internal/users/entities/User.entity';
import ES from './src/shared/types/enum/ES';

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('Database initialized');

    const articleRepository = container.get<IArticleRepository>(
      TYPES.IArticleRepository,
    );
    const userRepo = AppDataSource.getRepository(User);
    const clientRepo = AppDataSource.getRepository(Client);
    const topicRepo = AppDataSource.getRepository(Topic);
    const articleRepo = AppDataSource.getRepository(Article);
    const articleVersionRepo = AppDataSource.getRepository(ArticleVersion);

    // 1. Get or Create User
    let user = await userRepo.findOne({ where: {} });
    if (!user) {
      console.error('No user found, cannot proceed');
      return;
    }

    // 2. Create Client
    const client = new Client();
    client.client_name = `Test Client ${Date.now()}`;
    client.user = user;
    client.region = 'us';
    await clientRepo.save(client);
    console.log(`Client created: ${client.client_id}`);

    // 3. Create Topic
    const topic = new Topic();
    topic.topic_name = `Test Topic ${Date.now()}`;
    topic.client = client;
    topic.user = user;
    await topicRepo.save(topic);
    console.log(`Topic created: ${topic.topic_id}`);

    // 4. Create Article
    const article = new Article();
    article.topic = topic;
    article.user = user;
    await articleRepo.save(article);
    console.log(`Article created: ${article.article_id}`);

    // 5. Create ArticleVersion (Draft, NO CHUNKS)
    const articleVersion = new ArticleVersion();
    articleVersion.article = article;
    articleVersion.article_name = 'Draft Article No Chunks';
    articleVersion.version = 1;
    articleVersion.article_status = ES.DRAFT;
    articleVersion.user = user;
    articleVersion.user_update = user;
    articleVersion.user_publish = user;
    await articleVersionRepo.save(articleVersion);
    console.log(`ArticleVersion created: ${articleVersion.article_version_id}`);

    // 6. Query by Client ID
    console.log('Querying articles by Client ID...');
    const result = await articleRepository.findAndCountArticlesByClientId(
      client.client_id,
      { tagId: [] }, // filters
      null, // embeddingSql
      true, // canSeeDraft
    );

    console.log(`Found ${result.total} articles.`);
    console.log(
      'Articles:',
      result.articles.map((a) => a.article_name),
    );

    if (
      result.total === 1 &&
      result.articles[0] &&
      result.articles[0].article_id === article.article_id
    ) {
      console.log('SUCCESS: Found the article without chunks.');
    } else {
      console.error(
        'FAILURE: Did not find the article (or found unexpected number).',
      );
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

main();
