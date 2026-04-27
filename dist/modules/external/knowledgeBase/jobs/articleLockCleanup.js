"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const data_source_1 = require("../../../../shared/database/data-source");
const articleRepository = inversify_config_1.container.get(containerTypes_1.TYPES.IArticleRepository);
const cleanupAbandonedArticleLocks = async () => {
    const now = new Date();
    console.log(`[${now.toISOString()}] Running lock cleanup job...`);
    try {
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const result = await articleRepository.findAllLocked();
            if (!result || result.length === 0) {
                console.log(`[${now.toISOString()}] No abandoned lock(s) to clean up.`);
                return;
            }
            else {
                console.log(`[${now.toISOString()}] Cleaned up ${result.length} abandoned lock(s).`);
            }
            const articlesToSave = [];
            for (const article of result) {
                article.locked_by_user_id = null;
                article.lock_expires_at = null;
                articlesToSave.push(article);
            }
            await articleRepository.saveManyArticle(articlesToSave);
        });
    }
    catch (error) {
        console.error(`[${now.toISOString()}] CRITICAL: Lock cleanup job failed!`, error);
    }
};
const scheduledJob = node_cron_1.default.schedule('*/15 * * * *', cleanupAbandonedArticleLocks);
exports.default = scheduledJob;
//# sourceMappingURL=articleLockCleanup.js.map