import cron from 'node-cron';
import { container } from '../../../../shared/config/inversify.config';
import { IArticleRepository } from '../interfaces/articles/article.repository.interface';
import { TYPES } from '../../../../shared/config/containerTypes';
import { logger } from '../../../../shared/utils/logger';

const articleRepository = container.get<IArticleRepository>(
  TYPES.IArticleRepository,
);

const cleanupAbandonedArticleLocks = async () => {
  try {
    const cleared = await articleRepository.clearExpiredLocks();
    if (cleared > 0) logger.info(`Lock cleanup: ${cleared} expired lock(s) released.`);
  } catch (error) {
    logger.error('Lock cleanup job failed', error);
  }
};

const scheduledJob = cron.schedule('*/15 * * * *', cleanupAbandonedArticleLocks);

export default scheduledJob;
