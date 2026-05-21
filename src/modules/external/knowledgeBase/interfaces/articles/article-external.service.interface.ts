import { ExternalClientArticle, ExternalClientArticleDetail } from './article.service.interface';
import { FilterArticleInput } from '../../schema/articles/FilterArticleSchema';

export interface IArticleExternalService {
  findSharedArticlesByClientSharedId(
    filters: FilterArticleInput,
    clientSharedId: string,
  ): Promise<ExternalClientArticle[]>;

  getArticleByExternalClientAndArticleId(
    clientSharedId: string,
    versionId: string,
  ): Promise<ExternalClientArticleDetail>;

  findAllPublishedByClientSharedId(
    filters: FilterArticleInput,
    clientSharedId: string,
  ): Promise<ExternalClientArticle[]>;

  getArticleByExternalClientAndArticleIdAdmin(
    clientSharedId: string,
    versionId: string,
  ): Promise<ExternalClientArticleDetail>;
}
