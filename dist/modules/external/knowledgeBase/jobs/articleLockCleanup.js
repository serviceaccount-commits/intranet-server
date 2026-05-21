"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const logger_1 = require("../../../../shared/utils/logger");
const articleRepository = inversify_config_1.container.get(containerTypes_1.TYPES.IArticleRepository);
const cleanupAbandonedArticleLocks = async () => {
    try {
        const cleared = await articleRepository.clearExpiredLocks();
        if (cleared > 0)
            logger_1.logger.info(`Lock cleanup: ${cleared} expired lock(s) released.`);
    }
    catch (error) {
        logger_1.logger.error('Lock cleanup job failed', error);
    }
};
const scheduledJob = node_cron_1.default.schedule('*/15 * * * *', cleanupAbandonedArticleLocks);
exports.default = scheduledJob;
//# sourceMappingURL=articleLockCleanup.js.map