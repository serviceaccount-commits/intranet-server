import { ArticleLockInfo } from '../../database/kb-domain.types';

export interface IArticleLockService {
  startArticleEdit(userId: string, versionId: string): Promise<void>;
  refreshEditLock(userId: string, versionId: string): Promise<void>;
  closeArticleEdit(userId: string, versionId: string): Promise<void>;
  releaseAllArticleLocks(): Promise<void>;
  getArticleLockInfo(versionId: string): Promise<ArticleLockInfo>;
}
