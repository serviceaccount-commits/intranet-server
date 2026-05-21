import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IArticleRepository } from '../interfaces/articles/article.repository.interface';
import { ITopicRepository } from '../interfaces/topics/topic.repository.interface';
import { IClientRepository } from '../interfaces/clients/client.repository.interface';
import { IArticleExternalService } from '../interfaces/articles/article-external.service.interface';
import {
  ExternalClientArticle,
  ExternalClientArticleDetail,
} from '../interfaces/articles/article.service.interface';
import { FilterArticleInput } from '../schema/articles/FilterArticleSchema';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

@injectable()
export class ArticleExternalService implements IArticleExternalService {
  constructor(
    @inject(TYPES.IArticleRepository)
    private articleRepository: IArticleRepository,
    @inject(TYPES.ITopicRepository)
    private topicRepository: ITopicRepository,
    @inject(TYPES.IClientRepository)
    private clientRepository: IClientRepository,
  ) {}

  private async resolveTopicIdsForSharedClient(clientSharedId: string): Promise<string[]> {
    const client = await this.clientRepository.findBySharedId(clientSharedId);
    if (!client) return [];

    const topics = await this.topicRepository.findAllByClientId(client.client_id);
    return topics.map((t) => t.topic_id);
  }

  async findSharedArticlesByClientSharedId(
    filters: FilterArticleInput,
    clientSharedId: string,
  ): Promise<ExternalClientArticle[]> {
    const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
    if (topicIds.length === 0) return [];

    const views = await this.articleRepository.findPublishedByTopicIds(topicIds, filters);

    return views.map((v) => ({
      article_id: v.article_version_id,
      article_name: v.article_name,
      article_synopsis: v.article_synopsis,
      updated_at: v.updatedAt,
    }));
  }

  async getArticleByExternalClientAndArticleId(
    clientSharedId: string,
    versionId: string,
  ): Promise<ExternalClientArticleDetail> {
    const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
    if (topicIds.length === 0) throw new NotFoundError('Client', clientSharedId);

    const view = await this.articleRepository.findPublishedVersionByTopicIds(topicIds, versionId);
    if (!view) throw new NotFoundError('Article', versionId);

    return {
      article: {
        article_id: view.article_version_id,
        article_name: view.article_name,
        article_synopsis: view.article_synopsis,
        updated_at: view.updatedAt,
      },
      content: view.content,
    };
  }

  // ─── Admin variants (ignore `available_for_client` flag) ─────────────────────

  async findAllPublishedByClientSharedId(
    filters: FilterArticleInput,
    clientSharedId: string,
  ): Promise<ExternalClientArticle[]> {
    const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
    if (topicIds.length === 0) return [];

    const views = await this.articleRepository.findPublishedByTopicIds(
      topicIds,
      filters,
      true,
    );

    return views.map((v) => ({
      article_id: v.article_version_id,
      article_name: v.article_name,
      article_synopsis: v.article_synopsis,
      updated_at: v.updatedAt,
    }));
  }

  async getArticleByExternalClientAndArticleIdAdmin(
    clientSharedId: string,
    versionId: string,
  ): Promise<ExternalClientArticleDetail> {
    const topicIds = await this.resolveTopicIdsForSharedClient(clientSharedId);
    if (topicIds.length === 0) throw new NotFoundError('Client', clientSharedId);

    const view = await this.articleRepository.findPublishedVersionByTopicIds(
      topicIds,
      versionId,
      true,
    );
    if (!view) throw new NotFoundError('Article', versionId);

    return {
      article: {
        article_id: view.article_version_id,
        article_name: view.article_name,
        article_synopsis: view.article_synopsis,
        updated_at: view.updatedAt,
      },
      content: view.content,
    };
  }
}
