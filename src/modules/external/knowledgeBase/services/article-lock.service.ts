import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IArticleRepository } from '../interfaces/articles/article.repository.interface';
import { IArticleLockService } from '../interfaces/articles/article-lock.service.interface';
import { ArticleLockInfo } from '../database/kb-domain.types';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import { ARTICLE_LOCK_DURATION_MS } from '../kb.constants';

@injectable()
export class ArticleLockService implements IArticleLockService {
  constructor(
    @inject(TYPES.IArticleRepository)
    private articleRepository: IArticleRepository,
  ) {}

  async startArticleEdit(userId: string, versionId: string): Promise<void> {
    const lockInfo = await this.articleRepository.getLockInfo(versionId);
    if (!lockInfo) throw new NotFoundError('Article', versionId);

    const now = new Date();
    if (lockInfo.locked_by_user_id && lockInfo.lock_expires_at && lockInfo.lock_expires_at > now) {
      throw new BusinessLogicError('Article is currently being edited by another user.');
    }

    const expiresAt = new Date(now.getTime() + ARTICLE_LOCK_DURATION_MS);
    await this.articleRepository.acquireLock(versionId, userId, expiresAt);
  }

  async refreshEditLock(userId: string, versionId: string): Promise<void> {
    const lockInfo = await this.articleRepository.getLockInfo(versionId);
    if (!lockInfo) throw new NotFoundError('Article', versionId);

    if (lockInfo.locked_by_user_id && lockInfo.locked_by_user_id !== userId) {
      throw new BusinessLogicError('You do not own this lock.');
    }

    const expiresAt = new Date(Date.now() + ARTICLE_LOCK_DURATION_MS);
    await this.articleRepository.refreshLock(versionId, expiresAt);
  }

  async closeArticleEdit(userId: string, versionId: string): Promise<void> {
    const lockInfo = await this.articleRepository.getLockInfo(versionId);
    if (!lockInfo) throw new NotFoundError('Article', versionId);

    if (lockInfo.locked_by_user_id && lockInfo.locked_by_user_id !== userId) {
      throw new BusinessLogicError('You do not own this lock.');
    }

    await this.articleRepository.releaseLock(versionId);
  }

  async releaseAllArticleLocks(): Promise<void> {
    await this.articleRepository.releaseAllLocks();
  }

  async getArticleLockInfo(versionId: string): Promise<ArticleLockInfo> {
    const lockInfo = await this.articleRepository.getLockInfo(versionId);
    if (!lockInfo) throw new NotFoundError('Article', versionId);
    return lockInfo;
  }
}
