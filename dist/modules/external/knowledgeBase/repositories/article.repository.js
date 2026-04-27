"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const typeorm_1 = require("typeorm");
const appConfig_1 = __importDefault(require("../../../../shared/config/appConfig"));
const ArticleChunk_entity_1 = require("../entities/ArticleChunk.entity");
const ArticleVersion_entity_1 = require("../entities/ArticleVersion.entity");
const Article_entity_1 = require("../entities/Article.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let ArticleRepository = class ArticleRepository {
    async create(article) {
        return await data_source_1.AppDataSource.manager.save(article);
    }
    async save(article) {
        return await data_source_1.AppDataSource.manager.save(article);
    }
    async saveArticle(article) {
        return await data_source_1.AppDataSource.manager.save(article);
    }
    async saveMany(articles) {
        return await data_source_1.AppDataSource.manager.save(articles);
    }
    async saveManyArticle(articles) {
        return await data_source_1.AppDataSource.manager.save(articles);
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(ArticleVersion_entity_1.ArticleVersion);
    }
    async findAllByTopicId(topicId) {
        return await data_source_1.AppDataSource.manager.find(ArticleVersion_entity_1.ArticleVersion, {
            where: {
                article: { topic_id: topicId },
            },
            relations: {
                user_update: true,
                user_publish: true,
            },
        });
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(ArticleVersion_entity_1.ArticleVersion, {
            where: {
                article_version_id: id,
            },
            relations: {
                user_update: true,
                user_publish: true,
                user: true,
                document: true,
                tags: true,
                article: { topic: true },
            },
        });
    }
    async findLatestVersion(articleId) {
        return await data_source_1.AppDataSource.manager.findOne(ArticleVersion_entity_1.ArticleVersion, {
            where: {
                article_id: articleId,
            },
            order: {
                version: 'DESC',
            },
        });
    }
    async findByIdAndLockedById(id) {
        return await data_source_1.AppDataSource.manager.findOne(ArticleVersion_entity_1.ArticleVersion, {
            relations: {
                article: true,
            },
            where: {
                article_version_id: id,
            },
        });
    }
    async findByName(articleName) {
        return await data_source_1.AppDataSource.manager.findOne(ArticleVersion_entity_1.ArticleVersion, {
            where: {
                article_name: articleName,
            },
        });
    }
    async findVersionByArticleIdAndVersionNumber(articleId, version) {
        return await data_source_1.AppDataSource.manager.findOne(ArticleVersion_entity_1.ArticleVersion, {
            where: {
                article_id: articleId,
                version: version,
            },
        });
    }
    async findAllLocked() {
        const now = new Date();
        return await data_source_1.AppDataSource.manager.find(Article_entity_1.Article, {
            where: {
                lock_expires_at: (0, typeorm_1.LessThan)(now),
            },
        });
    }
    async findAllArticleLocked() {
        const now = new Date();
        return await data_source_1.AppDataSource.manager.find(Article_entity_1.Article, {
            where: {
                lock_expires_at: (0, typeorm_1.LessThan)(now),
            },
        });
    }
    async clearAllExpiredLocks() {
        const now = new Date();
        return await data_source_1.AppDataSource.manager.update(ArticleVersion_entity_1.ArticleVersion, { lock_expires_at: (0, typeorm_1.LessThan)(now) }, { locked_by_user_id: null });
    }
    async findAndCountArticles(filters, embeddingSql, canSeeDraft) {
        const { tagId, page, limit } = filters;
        // 1. The query now starts from ArticleChunk
        const queryBuilder = data_source_1.AppDataSource.manager
            .createQueryBuilder(ArticleChunk_entity_1.ArticleChunk, 'chunk')
            // 2. Join and select the parent article and its relations
            .leftJoinAndSelect('chunk.articleVersion', 'article_versions')
            .leftJoinAndSelect('article_versions.user_update', 'user_update')
            .leftJoin('article_versions.tags', 'tag')
            .where((qb) => {
            const subQuery = qb
                .subQuery()
                .select('MAX(av.version)')
                .from('article_versions', 'av')
                .where('av.article_id = article_versions.article_id');
            return 'article_versions.version = ' + subQuery.getQuery();
        }); // Just join tags for filtering
        if (!canSeeDraft) {
            queryBuilder.andWhere('article_versions.article_status = :articleStatus', {
                articleStatus: ES_1.default.PUBLISHED,
            });
        }
        // 3. Apply tag filtering (this logic remains the same)
        if (tagId !== undefined && tagId.length > 0) {
            const topicsIds = tagId[0]?.split(',');
            queryBuilder.andWhere('tag.tag_id IN (:...tagIds)', {
                tagIds: topicsIds,
            });
        }
        // 4. Apply the vector search to the CHUNK'S embedding
        if (embeddingSql) {
            const SIMILARITY_THRESHOLD = appConfig_1.default.searchSimilarityThreshold;
            console.log(`[DEBUG] AI Search. Threshold: ${SIMILARITY_THRESHOLD}`);
            queryBuilder
                .andWhere('chunk.embedding <=> :embedding::vector < :threshold')
                .orderBy('chunk.embedding <=> :embedding::vector', 'ASC')
                .setParameters({
                embedding: embeddingSql,
                threshold: SIMILARITY_THRESHOLD,
            });
        }
        else {
            // If there is no search, order by the article's update date
            queryBuilder.orderBy('article.updatedAt', 'DESC');
        }
        // 5. Get a list of the top matching chunks
        // We fetch a bit more (e.g., 20) to have enough data to find unique articles
        let chunks = await queryBuilder.limit(20).getMany();
        // --- DEBUGGING START ---
        if (embeddingSql && chunks.length === 0) {
            console.log('[DEBUG] No chunks found with current threshold.');
            const totalChunks = await data_source_1.AppDataSource.manager.count(ArticleChunk_entity_1.ArticleChunk);
            console.log(`[DEBUG] Total chunks in DB: ${totalChunks}`);
            if (totalChunks > 0) {
                // Find best match without threshold
                try {
                    const bestMatch = await data_source_1.AppDataSource.manager
                        .createQueryBuilder(ArticleChunk_entity_1.ArticleChunk, 'chunk')
                        .select(['chunk.chunk_id'])
                        .addSelect('chunk.embedding <=> :embedding::vector', 'distance')
                        .orderBy('distance', 'ASC')
                        .setParameter('embedding', embeddingSql) // Use setParameter instead of setParameters for single value
                        .limit(1)
                        .getRawOne();
                    console.log('[DEBUG] Best match distance found in DB:', bestMatch?.distance);
                }
                catch (e) {
                    console.error('[DEBUG] Failed to check best match:', e);
                }
            }
        }
        // --- DEBUGGING END ---
        // 6. De-duplicate the results to get a unique list of articles
        const uniqueArticlesMap = new Map();
        for (const chunk of chunks) {
            if (!uniqueArticlesMap.has(chunk.articleVersion.article_id)) {
                uniqueArticlesMap.set(chunk.articleVersion.article_id, {
                    // Build the final article object you want to return
                    article_version_id: chunk.articleVersion.article_version_id,
                    article_id: chunk.articleVersion.article_id,
                    article_name: chunk.articleVersion.article_name,
                    updatedAt: chunk.articleVersion.updatedAt,
                    user_update: chunk.articleVersion.user_update,
                    article_status: chunk.articleVersion.article_status,
                    // Crucially, include the chunk that matched for context!
                    relevant_content: chunk.content,
                });
            }
        }
        const articles = Array.from(uniqueArticlesMap.values());
        // Note on `total`: A simple .getManyAndCount() on chunks would give the total
        // number of matching chunks, not articles. For now, the total reflects the
        // count of the unique articles we found in our fetched batch.
        articles.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        const paginatedArticles = articles.slice((page - 1) * limit, page * limit);
        const total = articles.length;
        console.log('ARTICLES: ');
        console.log(articles);
        return { articles: paginatedArticles, total };
    }
    async findAndCountArticlesByTopicId(topicId, filters, embeddingSql, canSeeDraft) {
        console.log('CAN SEE DRAFT: ', canSeeDraft);
        const { tagId, page, limit } = filters;
        if (!embeddingSql) {
            const queryBuilder = data_source_1.AppDataSource.manager
                .createQueryBuilder(ArticleVersion_entity_1.ArticleVersion, 'article_versions')
                .select([
                'article_versions.article_version_id',
                'article_versions.article_id',
                'article_versions.article_name',
                'article_versions.updatedAt',
                'article_versions.article_status',
            ])
                .innerJoin('article_versions.article', 'article')
                .innerJoin('article.topic', 'topic')
                .leftJoin('article_versions.tags', 'tag')
                .leftJoin('article_versions.user_update', 'user_update')
                .where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('MAX(av.version)')
                    .from('article_versions', 'av')
                    .where('av.article_id = article_versions.article_id');
                return 'article_versions.version = ' + subQuery.getQuery();
            })
                .andWhere('topic.topic_id = :topicId', { topicId })
                .addSelect([
                'user_update.first_name',
                'user_update.last_name',
                'user_update.user_id',
            ]);
            if (!canSeeDraft) {
                queryBuilder.andWhere('article_versions.article_status = :articleStatus', {
                    articleStatus: ES_1.default.PUBLISHED,
                });
            }
            if (tagId !== undefined && tagId.length > 0) {
                queryBuilder.andWhere('tag.tag_id IN (:...tagIds)', {
                    tagIds: tagId[0]?.split(','),
                });
            }
            queryBuilder.skip((page - 1) * limit).take(limit);
            const [articles, total] = await queryBuilder
                .orderBy('article_versions.updatedAt', 'DESC')
                .getManyAndCount();
            return { articles, total };
        }
        // if (search !== undefined && search.length > 0) {
        //   queryBuilder.andWhere('article.article_name ILIKE :searchName', {
        //     searchName: `%${search}%`,
        //   });
        // }
        const queryBuilder = data_source_1.AppDataSource.manager
            .createQueryBuilder(ArticleChunk_entity_1.ArticleChunk, 'chunk')
            .innerJoinAndSelect('chunk.articleVersion', 'article_versions')
            .innerJoin('article_versions.article', 'article')
            .innerJoin('article.topic', 'topic')
            .leftJoin('article_versions.tags', 'tag')
            .leftJoin('article_versions.user_update', 'user_update')
            .where((qb) => {
            const subQuery = qb
                .subQuery()
                .select('MAX(av.version)')
                .from('article_versions', 'av')
                .where('av.article_id = article_versions.article_id');
            return 'article_versions.version = ' + subQuery.getQuery();
        })
            .andWhere('topic.topic_id = :topicId', { topicId })
            .addSelect([
            'user_update.first_name',
            'user_update.last_name',
            'user_update.user_id',
        ]);
        if (!canSeeDraft) {
            queryBuilder.andWhere('article_versions.article_status = :articleStatus', {
                articleStatus: ES_1.default.PUBLISHED,
            });
        }
        if (tagId !== undefined && tagId.length > 0) {
            queryBuilder.andWhere('tag.tag_id IN (:...tagIds)', {
                tagIds: tagId[0]?.split(','),
            });
        }
        if (embeddingSql) {
            console.log('APPLYING EMBEDDING');
            const SIMILARITY_THRESHOLD = appConfig_1.default.searchSimilarityThreshold;
            queryBuilder
                .andWhere('chunk.embedding <=> :embedding < :threshold')
                .orderBy('chunk.embedding <=> :embedding', 'ASC')
                .setParameters({
                embedding: embeddingSql,
                threshold: SIMILARITY_THRESHOLD,
            });
        }
        const chunks = await queryBuilder.limit(20).getMany();
        const uniqueArticlesMap = new Map();
        for (const chunk of chunks) {
            if (!uniqueArticlesMap.has(chunk.articleVersion.article_id)) {
                uniqueArticlesMap.set(chunk.articleVersion.article_id, {
                    // Build the final article object you want to return
                    article_id: chunk.articleVersion.article_id,
                    article_version_id: chunk.articleVersion.article_version_id,
                    article_name: chunk.articleVersion.article_name,
                    updatedAt: chunk.articleVersion.updatedAt,
                    user_update: chunk.articleVersion.user_update,
                    article_status: chunk.articleVersion.article_status,
                    // Crucially, include the chunk that matched for context!
                    relevant_content: chunk.content,
                });
            }
        }
        const articles = Array.from(uniqueArticlesMap.values());
        articles.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        const paginatedArticles = articles.slice((page - 1) * limit, page * limit);
        const total = articles.length;
        return { articles: paginatedArticles, total };
    }
    // TODO: REMOVE FILTER
    async findAndCountArticlesByClientId(clientId, filters, embeddingSql, canSeeDraft) {
        console.log('CAN SEE DRAFT: ', canSeeDraft);
        const { tagId, page, limit } = filters;
        if (!embeddingSql) {
            const queryBuilder = data_source_1.AppDataSource.manager
                .createQueryBuilder(ArticleVersion_entity_1.ArticleVersion, 'article_versions')
                .select([
                'article_versions.article_version_id',
                'article_versions.article_id',
                'article_versions.article_name',
                'article_versions.updatedAt',
                'article_versions.article_status',
            ])
                .innerJoin('article_versions.article', 'article')
                .innerJoin('article.topic', 'topic')
                .innerJoin('topic.client', 'client')
                .leftJoin('article_versions.tags', 'tag')
                .leftJoin('article_versions.user_update', 'user_update')
                .where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('MAX(av.version)')
                    .from('article_versions', 'av')
                    .where('av.article_id = article_versions.article_id');
                return 'article_versions.version = ' + subQuery.getQuery();
            })
                .andWhere('client.client_id = :clientId', { clientId })
                .addSelect([
                'user_update.first_name',
                'user_update.last_name',
                'user_update.user_id',
            ]);
            if (!canSeeDraft) {
                queryBuilder.andWhere('article_versions.article_status = :articleStatus', {
                    articleStatus: ES_1.default.PUBLISHED,
                });
            }
            if (tagId !== undefined && tagId.length > 0) {
                queryBuilder.andWhere('tag.tag_id IN (:...tagIds)', {
                    tagIds: tagId[0]?.split(','),
                });
            }
            queryBuilder.skip((page - 1) * limit).take(limit);
            const [articles, total] = await queryBuilder
                .orderBy('article_versions.updatedAt', 'DESC')
                .getManyAndCount();
            return { articles, total };
        }
        // if (search !== undefined && search.length > 0) {
        //   queryBuilder.andWhere('article.article_name ILIKE :searchName', {
        //     searchName: `%${search}%`,
        //   });
        // }
        const queryBuilder = data_source_1.AppDataSource.manager
            .createQueryBuilder(ArticleChunk_entity_1.ArticleChunk, 'chunk')
            .innerJoinAndSelect('chunk.articleVersion', 'article_versions')
            .innerJoin('article_versions.article', 'article')
            .innerJoin('article.topic', 'topic')
            .innerJoin('topic.client', 'client')
            .leftJoin('article_versions.tags', 'tag')
            .leftJoin('article_versions.user_update', 'user_update')
            .where((qb) => {
            const subQuery = qb
                .subQuery()
                .select('MAX(av.version)')
                .from('article_versions', 'av')
                .where('av.article_id = article_versions.article_id');
            return 'article_versions.version = ' + subQuery.getQuery();
        })
            .andWhere('client.client_id = :clientId', { clientId })
            .addSelect([
            'user_update.first_name',
            'user_update.last_name',
            'user_update.user_id',
        ]);
        if (!canSeeDraft) {
            queryBuilder.andWhere('article_versions.article_status = :articleStatus', {
                articleStatus: ES_1.default.PUBLISHED,
            });
        }
        if (tagId !== undefined && tagId.length > 0) {
            queryBuilder.andWhere('tag.tag_id IN (:...tagIds)', {
                tagIds: tagId[0]?.split(','),
            });
        }
        if (embeddingSql) {
            console.log('APPLYING EMBEDDING');
            const SIMILARITY_THRESHOLD = appConfig_1.default.searchSimilarityThreshold;
            queryBuilder
                .andWhere('chunk.embedding <=> :embedding < :threshold')
                .orderBy('chunk.embedding <=> :embedding', 'ASC')
                .setParameters({
                embedding: embeddingSql,
                threshold: SIMILARITY_THRESHOLD,
            });
        }
        const chunks = await queryBuilder.limit(20).getMany();
        const uniqueArticlesMap = new Map();
        for (const chunk of chunks) {
            if (!uniqueArticlesMap.has(chunk.articleVersion.article_id)) {
                uniqueArticlesMap.set(chunk.articleVersion.article_id, {
                    // Build the final article object you want to return
                    article_id: chunk.articleVersion.article_id,
                    article_version_id: chunk.articleVersion.article_version_id,
                    article_name: chunk.articleVersion.article_name,
                    updatedAt: chunk.articleVersion.updatedAt,
                    user_update: chunk.articleVersion.user_update,
                    article_status: chunk.articleVersion.article_status,
                    // Crucially, include the chunk that matched for context!
                    relevant_content: chunk.content,
                });
            }
        }
        const articles = Array.from(uniqueArticlesMap.values());
        articles.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        const paginatedArticles = articles.slice((page - 1) * limit, page * limit);
        const total = articles.length;
        return { articles: paginatedArticles, total };
    }
    async findAllLatestByUserId(clientIds) {
        const articleLimit = 5;
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(ArticleVersion_entity_1.ArticleVersion, 'articleVersion')
            .select([
            'articleVersion.article_version_id',
            'articleVersion.article_name',
            'articleVersion.updatedAt',
            'articleVersion.article_synopsis',
        ])
            .leftJoinAndSelect('articleVersion.article', 'article')
            .leftJoinAndSelect('article.topic', 'topic')
            .leftJoinAndSelect('topic.client', 'client')
            .where('client.client_id IN (:...clientIds)', {
            clientIds,
        })
            .orderBy('articleVersion.updatedAt', 'DESC')
            .take(articleLimit)
            .getMany();
    }
    async findByIds(articleIds) {
        return await data_source_1.AppDataSource.manager.find(ArticleVersion_entity_1.ArticleVersion, {
            where: {
                article_version_id: (0, typeorm_1.In)(articleIds),
            },
            relations: {
                article: { topic: true },
            },
        });
    }
    async findVersionsByVersionId(versionId) {
        // First, find the single article version to get its parent article_id
        const articleVersion = await data_source_1.AppDataSource.manager.findOne(ArticleVersion_entity_1.ArticleVersion, {
            select: ['article_id'],
            where: { article_version_id: versionId },
        });
        if (!articleVersion) {
            return []; // Or throw a NotFoundError
        }
        // Now, find all versions that belong to that same parent article
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(ArticleVersion_entity_1.ArticleVersion, 'av')
            .select([
            'av.article_version_id',
            'av.article_name',
            'av.version',
            'av.article_status',
            'av.updatedAt',
        ])
            .where('av.article_id = :articleId', {
            articleId: articleVersion.article_id,
        })
            .orderBy('av.version', 'DESC')
            .getMany();
    }
    async findSharedArticlesByClientSharedId(clientSharedId, embeddingSql) {
        if (!embeddingSql) {
            return await data_source_1.AppDataSource.manager
                .createQueryBuilder(ArticleVersion_entity_1.ArticleVersion, 'article_versions')
                .innerJoin('article_versions.article', 'article')
                .innerJoin('article.topic', 'topic')
                .innerJoin('topic.client', 'client')
                .where('client.client_shared_id = :clientSharedId', {
                clientSharedId,
            })
                .andWhere('article.available_for_client = true')
                .andWhere('article_versions.article_status = :articleStatus', {
                articleStatus: ES_1.default.PUBLISHED,
            })
                .orderBy('article_versions.updatedAt', 'DESC')
                .getMany();
        }
        const queryBuilder = data_source_1.AppDataSource.manager
            .createQueryBuilder(ArticleChunk_entity_1.ArticleChunk, 'chunk')
            .leftJoinAndSelect('chunk.articleVersion', 'article_versions')
            .leftJoinAndSelect('article_versions.article', 'article')
            .leftJoinAndSelect('article.topic', 'topic')
            .leftJoinAndSelect('topic.client', 'client')
            .where('client.client_shared_id = :clientSharedId', {
            clientSharedId,
        })
            .andWhere('article.available_for_client = true')
            .andWhere('article_versions.article_status = :articleStatus', {
            articleStatus: ES_1.default.PUBLISHED,
        })
            .orderBy('article_versions.updatedAt', 'DESC');
        if (embeddingSql) {
            console.log('APPLYING EMBEDDING');
            const SIMILARITY_THRESHOLD = appConfig_1.default.searchSimilarityThreshold;
            queryBuilder
                .andWhere('chunk.embedding <=> :embedding < :threshold')
                .orderBy('chunk.embedding <=> :embedding', 'ASC')
                .setParameters({
                embedding: embeddingSql,
                threshold: SIMILARITY_THRESHOLD,
            });
        }
        const chunks = await queryBuilder.limit(20).getMany();
        console.log('CHUNKS', chunks);
        const uniqueArticlesMap = new Map();
        for (const chunk of chunks) {
            if (!uniqueArticlesMap.has(chunk.articleVersion.article_id)) {
                uniqueArticlesMap.set(chunk.articleVersion.article_id, {
                    article_id: chunk.articleVersion.article_id,
                    article_name: chunk.articleVersion.article_name,
                    article_synopsis: chunk.articleVersion.article_synopsis,
                    updatedAt: chunk.articleVersion.updatedAt,
                    relevant_content: chunk.content,
                });
            }
        }
        const articles = Array.from(uniqueArticlesMap.values());
        console.log('ARTICLES', articles);
        return articles;
    }
    async getArticleByExternalClientAndArticleId(clientSharedId, articleId) {
        return await data_source_1.AppDataSource.manager.findOne(ArticleVersion_entity_1.ArticleVersion, {
            where: {
                article_id: articleId,
                article: {
                    topic: { client: { client_shared_id: clientSharedId } },
                },
                article_status: ES_1.default.PUBLISHED,
            },
            relations: {
                document: true,
            },
        });
    }
};
exports.ArticleRepository = ArticleRepository;
exports.ArticleRepository = ArticleRepository = __decorate([
    (0, inversify_1.injectable)()
], ArticleRepository);
//# sourceMappingURL=article.repository.js.map