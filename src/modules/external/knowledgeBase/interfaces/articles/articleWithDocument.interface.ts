import { KbArticleVersionView } from '../../database/kb-domain.types';
import { ExternalClientArticle, ExternalClientArticleDetail } from './article.service.interface';

/** @deprecated Use KbArticleVersionView directly — content is now embedded in the view. */
export interface ArticleWithDocument {
  article: KbArticleVersionView;
  document: string;
  available_for_client: boolean;
}

export { ExternalClientArticle, ExternalClientArticleDetail };
