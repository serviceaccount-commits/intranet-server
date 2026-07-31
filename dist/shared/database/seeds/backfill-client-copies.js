"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * One-off backfill for the dual-view feature.
 *
 *  1. For every article without a `client_copy`, seeds one from its latest
 *     published version (falling back to the highest-numbered version).
 *  2. Stamps `audience: 'internal'` on every chunk that predates the audience
 *     field, so internal search keeps working.
 *
 * It does NOT generate client-copy embeddings (that needs the Gemini pipeline).
 * After running this, hit the admin reindex endpoint
 * (`POST /api/v1/external/admin/articles/reindex`) to build the client chunks.
 *
 * Run with: ts-node src/shared/database/seeds/backfill-client-copies.ts
 */
const mongodb_1 = require("mongodb");
const cheerio = __importStar(require("cheerio"));
const appConfig_1 = __importDefault(require("../../config/appConfig"));
const mongo_connection_1 = require("../mongo-connection");
const kb_collections_1 = require("../../../modules/external/knowledgeBase/database/kb-collections");
function htmlToText(html) {
    const $ = cheerio.load(html ?? '');
    return $.root().text().replace(/\s+/g, ' ').trim();
}
/** Latest published version, else the highest-numbered version. */
function pickSeedVersion(versions) {
    if (!versions || versions.length === 0)
        return null;
    const published = versions.filter((v) => v.article_status === 'published');
    const pool = published.length > 0 ? published : versions;
    return pool.reduce((max, v) => (v.version > max.version ? v : max));
}
async function main() {
    await (0, mongo_connection_1.connectMongoDB)(appConfig_1.default.mongodb.uri, appConfig_1.default.mongodb.dbName);
    const db = (0, mongo_connection_1.getMongoDb)();
    const articles = db.collection(kb_collections_1.KB_COLLECTIONS.ARTICLES);
    const chunks = db.collection(kb_collections_1.KB_COLLECTIONS.ARTICLE_CHUNKS);
    // 1. Seed client copies.
    const cursor = articles.find({ client_copy: { $in: [null, undefined] } });
    let seeded = 0;
    let skipped = 0;
    for await (const article of cursor) {
        const seed = pickSeedVersion(article.versions);
        if (!seed) {
            skipped++;
            continue;
        }
        const now = new Date();
        const clientCopy = {
            _id: new mongodb_1.ObjectId(),
            article_name: seed.article_name,
            article_synopsis: seed.article_synopsis,
            content: seed.content,
            content_text: htmlToText(seed.content),
            content_storage: 'inline',
            updated_by: seed.updated_by ?? null,
            updated_by_name: seed.updated_by_name ?? null,
            seeded_from_version_id: seed._id,
            createdAt: now,
            updatedAt: now,
        };
        await articles.updateOne({ _id: article._id }, { $set: { client_copy: clientCopy } });
        seeded++;
    }
    // 2. Stamp audience on legacy chunks.
    const chunkRes = await chunks.updateMany({ audience: { $exists: false } }, { $set: { audience: 'internal' } });
    console.log(`Backfill done: client_copy seeded=${seeded} skipped(no versions)=${skipped}; ` +
        `chunks stamped internal=${chunkRes.modifiedCount}`);
    console.log('Next: POST /api/v1/external/admin/articles/reindex (admin key) to build client chunks.');
}
main()
    .catch((err) => {
    console.error(err);
    process.exitCode = 1;
})
    .finally(async () => {
    await (0, mongo_connection_1.disconnectMongoDB)();
});
//# sourceMappingURL=backfill-client-copies.js.map