"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleSearchService = void 0;
exports.buildPreview = buildPreview;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const kb_collections_1 = require("../database/kb-collections");
const mongo_connection_1 = require("../../../../shared/database/mongo-connection");
const ai_service_1 = require("../../../../shared/utils/ai.service");
const logger_1 = require("../../../../shared/utils/logger");
/** Adapts a client-copy view to the flat version-view shape the search hit and
 *  its consumers expect (article id = the client copy id). */
function clientCopyToHitView(c) {
    return {
        article_id: c.article_id,
        topic_id: c.topic_id,
        user_id: null,
        locked_by_user_id: null,
        lock_expires_at: null,
        available_for_client: c.available_for_client,
        available_for_ai: false,
        article_property: c.article_property,
        article_version_id: c.client_copy_id,
        article_name: c.article_name,
        article_synopsis: c.article_synopsis,
        article_status: 'published',
        version: 1,
        content: c.content,
        content_storage: 'inline',
        tag_ids: [],
        created_by: null,
        updated_by: c.updated_by,
        updated_by_name: c.updated_by_name,
        published_by: null,
        published_at: null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    };
}
const RRF_K = 60;
// Semantic-first fusion: the vector ranking carries full weight so a question
// or a paraphrase ("cómo cuido la piel después del botox") orders results by
// meaning; the literal text ranking only nudges exact title/body matches up.
const VECTOR_WEIGHT = Number(process.env['KB_SEARCH_VECTOR_WEIGHT'] ?? '1');
const TEXT_WEIGHT = Number(process.env['KB_SEARCH_TEXT_WEIGHT'] ?? '0.5');
const DEFAULT_LIMIT = 20;
const VECTOR_TOP_K = 50;
const TEXT_TOP_K = 50;
const PREVIEW_LENGTH = 280;
// UAT CQ-23: without a relevance gate, nonsense queries returned the nearest
// neighbors instead of an empty state. Two signals separate them cleanly in
// this embedding space (measured in prod, 788 chunks): real queries reach
// topSim >= ~0.715 while gibberish caps at ~0.674, AND real queries spread
// the corpus (std >= ~0.030) while gibberish scores flat (std <= ~0.018).
// A query passes if EITHER signal clears its knob (lenient on purpose — a
// z-score/contrast gate was tried first and misclassified generic real terms).
// All knobs env-tunable (pm2 restart, no rebuild). Text-index hits unaffected.
const MIN_VECTOR_SIMILARITY = Number(process.env['KB_SEARCH_MIN_SIMILARITY'] ?? '0.45');
const MIN_TOP_SIMILARITY = Number(process.env['KB_SEARCH_MIN_TOP_SIM'] ?? '0.695');
const MIN_SIMILARITY_STD = Number(process.env['KB_SEARCH_MIN_STD'] ?? '0.025');
let ArticleSearchService = class ArticleSearchService {
    chunkRepository;
    articleRepository;
    // In-memory cache of all chunk embeddings. Refreshed lazily; safe to be
    // slightly stale because the persistence layer is the source of truth.
    cache = [];
    cacheLoadedAt = null;
    cacheTtlMs = 5 * 60 * 1000;
    constructor(chunkRepository, articleRepository) {
        this.chunkRepository = chunkRepository;
        this.articleRepository = articleRepository;
    }
    invalidateCache() {
        this.cacheLoadedAt = null;
    }
    async ensureCache() {
        const fresh = this.cacheLoadedAt !== null && Date.now() - this.cacheLoadedAt < this.cacheTtlMs;
        if (fresh && this.cache.length > 0)
            return;
        this.cache = await this.chunkRepository.loadAllForSearch();
        this.cacheLoadedAt = Date.now();
        logger_1.logger.info(`[search] chunk cache loaded: ${this.cache.length} chunks`);
    }
    async search(query, options = {}) {
        const trimmed = (query ?? '').trim();
        if (!trimmed)
            return [];
        const limit = options.limit ?? DEFAULT_LIMIT;
        const allowedStatuses = options.statuses ?? ['published'];
        const audience = options.audience ?? 'internal';
        const [vectorRanking, textRanking] = await Promise.all([
            this.vectorSearch(trimmed, audience),
            // Text search: the internal corpus uses the articles $text index (which
            // only covers internal versions — Mongo allows one text index per
            // collection). The client corpus gets an equivalent literal match over
            // client_copy.{article_name,article_synopsis,content_text}, scoped to
            // the caller's topics: a plain word that appears in an article's body
            // ("domicilio" in a consent form) has no semantic signal for the vector
            // gate and used to return the empty state (UAT CQ-02 #4).
            audience === 'internal'
                ? this.textSearch(trimmed)
                : this.clientTextSearch(trimmed, options.topicIds),
        ]);
        const fused = this.fuseRankings(vectorRanking, textRanking);
        if (fused.length === 0)
            return [];
        const ids = fused.map((f) => f.version_id);
        if (audience === 'client') {
            const copies = await this.articleRepository.findClientCopyViewsByCopyIds(ids);
            const byId = new Map(copies.map((c) => [c.client_copy_id, c]));
            const hits = [];
            for (const f of fused) {
                const copy = byId.get(f.version_id);
                if (!copy)
                    continue;
                if (options.topicIds && options.topicIds.length > 0 && !options.topicIds.includes(copy.topic_id))
                    continue;
                hits.push({
                    article: clientCopyToHitView(copy),
                    matched_chunk_preview: f.preview,
                    score: f.score,
                    vector_rank: f.vector_rank,
                    text_rank: f.text_rank,
                });
                if (hits.length >= limit)
                    break;
            }
            return hits;
        }
        const articles = await this.articleRepository.findByVersionIds(ids);
        const articleByVersionId = new Map(articles.map((a) => [a.article_version_id, a]));
        const hits = [];
        for (const f of fused) {
            const article = articleByVersionId.get(f.version_id);
            if (!article)
                continue;
            if (!allowedStatuses.includes(article.article_status))
                continue;
            if (options.topicIds && options.topicIds.length > 0 && !options.topicIds.includes(article.topic_id))
                continue;
            hits.push({
                article,
                matched_chunk_preview: f.preview,
                score: f.score,
                vector_rank: f.vector_rank,
                text_rank: f.text_rank,
            });
            if (hits.length >= limit)
                break;
        }
        return hits;
    }
    // ─── Vector path ──────────────────────────────────────────────────────────────
    async vectorSearch(query, audience = 'internal') {
        await this.ensureCache();
        if (this.cache.length === 0)
            return [];
        const queryEmbedding = await (0, ai_service_1.getEmbedding)(query, 'query');
        const scored = this.cache
            .filter((c) => c.audience === audience)
            .map((c) => ({
            version_id: c.version_id,
            chunk_id: c._id,
            content: c.content,
            similarity: cosineSimilarity(queryEmbedding, c.embedding),
        }));
        scored.sort((a, b) => b.similarity - a.similarity);
        const topSimilarity = scored[0]?.similarity ?? 0;
        const mean = scored.reduce((sum, s) => sum + s.similarity, 0) / scored.length;
        const variance = scored.reduce((sum, s) => sum + (s.similarity - mean) ** 2, 0) / scored.length;
        const std = Math.sqrt(variance);
        const passesGate = topSimilarity >= MIN_TOP_SIMILARITY || std >= MIN_SIMILARITY_STD;
        logger_1.logger.info(`[search] q="${query.slice(0, 60)}" audience=${audience} topSim=${topSimilarity.toFixed(3)} ` +
            `mean=${mean.toFixed(3)} std=${std.toFixed(3)} ` +
            `gate=${passesGate ? 'PASS' : 'EMPTY'} (minTopSim=${MIN_TOP_SIMILARITY}, minStd=${MIN_SIMILARITY_STD})`);
        if (!passesGate)
            return [];
        const relevant = scored.filter((s) => s.similarity >= MIN_VECTOR_SIMILARITY);
        // Collapse to best chunk per version_id, then take top K. The preview is
        // built only for the winners (an 800-token chunk rarely starts with the
        // passage that answered the query).
        const seen = new Set();
        const best = [];
        for (const s of relevant) {
            if (seen.has(s.version_id))
                continue;
            seen.add(s.version_id);
            best.push({
                version_id: s.version_id,
                chunk_id: s.chunk_id,
                preview: buildPreview(s.content, query),
                similarity: s.similarity,
            });
            if (best.length >= VECTOR_TOP_K)
                break;
        }
        return best;
    }
    // ─── Text path ────────────────────────────────────────────────────────────────
    async textSearch(query) {
        const col = (0, kb_collections_1.getArticlesCollection)((0, mongo_connection_1.getMongoDb)());
        const docs = await col
            .aggregate([
            { $match: { $text: { $search: query } } },
            { $addFields: { textScore: { $meta: 'textScore' } } },
            { $unwind: '$versions' },
            { $sort: { textScore: -1, 'versions.updatedAt': -1 } },
            { $limit: TEXT_TOP_K },
            { $project: { _id: 0, version_id: { $toString: '$versions._id' } } },
        ])
            .toArray();
        return docs.map((d) => ({ version_id: d['version_id'] }));
    }
    /** Literal (case/diacritic-insensitive) match over the CLIENT COPY fields,
     *  restricted to `topicIds` (a client's tree is small, so a scoped regex is
     *  cheap and needs no extra index). Returns copy ids, best-first by how
     *  many query words hit and where (name > synopsis > body). */
    async clientTextSearch(query, topicIds) {
        const words = query
            .split(/\s+/)
            .map((w) => w.trim())
            .filter((w) => w.length >= 3)
            .slice(0, 6);
        if (words.length === 0)
            return [];
        const escape = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Fold common Spanish diacritics on both sides so "asesoria" hits "asesoría".
        const fold = (w) => escape(w)
            .replace(/[aá]/gi, '[aá]')
            .replace(/[eé]/gi, '[eé]')
            .replace(/[ií]/gi, '[ií]')
            .replace(/[oó]/gi, '[oó]')
            .replace(/[uúü]/gi, '[uúü]')
            .replace(/[nñ]/gi, '[nñ]');
        const patterns = words.map((w) => new RegExp(fold(w), 'i'));
        const col = (0, kb_collections_1.getArticlesCollection)((0, mongo_connection_1.getMongoDb)());
        const match = {
            client_copy: { $exists: true },
            available_for_client: true,
        };
        if (topicIds && topicIds.length > 0)
            match['topic_id'] = { $in: topicIds };
        const docs = await col
            .find(match, {
            projection: {
                _id: 1,
                'client_copy._id': 1,
                'client_copy.article_name': 1,
                'client_copy.article_synopsis': 1,
                'client_copy.content_text': 1,
                'client_copy.content': 1,
            },
        })
            .toArray();
        const scored = [];
        for (const d of docs) {
            const copy = d.client_copy;
            if (!copy)
                continue;
            const name = copy.article_name ?? '';
            const synopsis = copy.article_synopsis ?? '';
            // Fall back to a crude tag-strip when content_text was never extracted.
            const body = copy.content_text ?? (copy.content ?? '').replace(/<[^>]+>/g, ' ');
            let score = 0;
            for (const re of patterns) {
                if (re.test(name))
                    score += 3;
                else if (re.test(synopsis))
                    score += 2;
                else if (re.test(body))
                    score += 1;
            }
            // Every word must hit somewhere — AND semantics, like the vector path's
            // intent — otherwise long queries match noise.
            const allHit = patterns.every((re) => re.test(name) || re.test(synopsis) || re.test(body));
            if (allHit && score > 0)
                scored.push({ version_id: copy._id.toString(), score });
        }
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, TEXT_TOP_K).map((s) => ({ version_id: s.version_id }));
    }
    // ─── RRF fusion ───────────────────────────────────────────────────────────────
    fuseRankings(vec, text) {
        const scores = new Map();
        vec.forEach((v, i) => {
            const rank = i + 1;
            scores.set(v.version_id, {
                score: VECTOR_WEIGHT / (RRF_K + rank),
                preview: v.preview,
                vector_rank: rank,
                text_rank: null,
            });
        });
        text.forEach((t, i) => {
            const rank = i + 1;
            const existing = scores.get(t.version_id);
            if (existing) {
                existing.score += TEXT_WEIGHT / (RRF_K + rank);
                existing.text_rank = rank;
            }
            else {
                scores.set(t.version_id, {
                    score: TEXT_WEIGHT / (RRF_K + rank),
                    preview: null,
                    vector_rank: null,
                    text_rank: rank,
                });
            }
        });
        return Array.from(scores.entries())
            .map(([version_id, v]) => ({ version_id, ...v }))
            .sort((a, b) => b.score - a.score);
    }
};
exports.ArticleSearchService = ArticleSearchService;
exports.ArticleSearchService = ArticleSearchService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleChunkRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IArticleRepository)),
    __metadata("design:paramtypes", [Object, Object])
], ArticleSearchService);
// ─── Preview ────────────────────────────────────────────────────────────────────
const STOPWORDS = new Set([
    'que', 'qué', 'como', 'cómo', 'cual', 'cuál', 'cuales', 'cuáles', 'cuando', 'cuándo',
    'donde', 'dónde', 'quien', 'quién', 'por', 'para', 'con', 'sin', 'sobre', 'entre',
    'del', 'los', 'las', 'una', 'unos', 'unas', 'the', 'and', 'for', 'with', 'what',
    'how', 'when', 'where', 'which', 'who', 'does', 'this', 'that', 'are', 'can',
    'hay', 'hace', 'hacer', 'debe', 'deben', 'tiene', 'tienen', 'puede', 'pueden',
    'ser', 'son', 'esta', 'estan', 'mas', 'pero', 'tambien',
]);
function foldDiacritics(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
/** Picks the passage of `chunk` most likely to be the one that matched the
 *  query: the sentence with the most query words (diacritics folded,
 *  stopwords dropped), extended with its neighbours up to PREVIEW_LENGTH.
 *  Falls back to the chunk start when no word hits (a purely semantic match). */
function buildPreview(chunk, query) {
    const text = (chunk ?? '').replace(/\s+/g, ' ').trim();
    if (text.length <= PREVIEW_LENGTH)
        return text;
    const terms = Array.from(new Set(foldDiacritics(query)
        .split(/[^a-z0-9ñ]+/)
        .filter((w) => w.length >= 3 && !STOPWORDS.has(w))));
    const sentences = text.split(/(?<=[.!?:;])\s+/).filter((s) => s.length > 0);
    let bestIdx = -1;
    let bestHits = 0;
    if (terms.length > 0) {
        sentences.forEach((sentence, i) => {
            const folded = foldDiacritics(sentence);
            const hits = terms.reduce((n, t) => (folded.includes(t) ? n + 1 : n), 0);
            if (hits > bestHits) {
                bestHits = hits;
                bestIdx = i;
            }
        });
    }
    if (bestIdx < 0)
        return `${text.slice(0, PREVIEW_LENGTH).trimEnd()}…`;
    // Grow around the best sentence while the window still fits.
    let start = bestIdx;
    let end = bestIdx;
    let out = sentences[bestIdx];
    while (out.length < PREVIEW_LENGTH) {
        const next = sentences[end + 1];
        if (next && out.length + next.length + 1 <= PREVIEW_LENGTH) {
            out = `${out} ${next}`;
            end++;
            continue;
        }
        const prev = sentences[start - 1];
        if (prev && out.length + prev.length + 1 <= PREVIEW_LENGTH) {
            out = `${prev} ${out}`;
            start--;
            continue;
        }
        break;
    }
    if (out.length > PREVIEW_LENGTH)
        out = `${out.slice(0, PREVIEW_LENGTH).trimEnd()}…`;
    const leading = start > 0 ? '… ' : '';
    const trailing = end < sentences.length - 1 && !out.endsWith('…') ? ' …' : '';
    return `${leading}${out}${trailing}`;
}
// ─── Math ───────────────────────────────────────────────────────────────────────
function cosineSimilarity(a, b) {
    if (a.length !== b.length || a.length === 0)
        return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        const ai = a[i];
        const bi = b[i];
        dot += ai * bi;
        normA += ai * ai;
        normB += bi * bi;
    }
    if (normA === 0 || normB === 0)
        return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
//# sourceMappingURL=articleSearch.service.js.map