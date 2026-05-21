"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoDB = connectMongoDB;
exports.disconnectMongoDB = disconnectMongoDB;
exports.getMongoDb = getMongoDb;
const mongodb_1 = require("mongodb");
const kb_collections_1 = require("../../modules/external/knowledgeBase/database/kb-collections");
const logger_1 = require("../utils/logger");
// ─── Singleton ────────────────────────────────────────────────────────────────
let client = null;
let db = null;
// ─── Connect ─────────────────────────────────────────────────────────────────
async function connectMongoDB(uri, dbName) {
    if (client && db) {
        logger_1.logger.debug('MongoDB: already connected, reusing existing connection.');
        return;
    }
    try {
        client = new mongodb_1.MongoClient(uri, {
            serverApi: {
                version: mongodb_1.ServerApiVersion.v1,
                strict: false,
                deprecationErrors: true,
            },
            // Connection pool — max 10 simultaneous connections
            maxPoolSize: 10,
            minPoolSize: 2,
            // Timeouts
            connectTimeoutMS: 10_000,
            socketTimeoutMS: 45_000,
            serverSelectionTimeoutMS: 10_000,
        });
        await client.connect();
        // Ping to confirm the connection is alive
        await client.db('admin').command({ ping: 1 });
        db = client.db(dbName);
        logger_1.logger.info(`MongoDB connected — database: "${dbName}"`);
        await (0, kb_collections_1.setupKbCollections)(db);
        client.on('close', () => {
            logger_1.logger.warn('MongoDB connection closed unexpectedly.');
            client = null;
            db = null;
        });
        client.on('error', (error) => {
            logger_1.logger.error('MongoDB client error:', error.message);
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger_1.logger.error(`MongoDB connection failed: ${message}`);
        // Clean up on failure so the next attempt starts fresh
        await client?.close().catch(() => { });
        client = null;
        db = null;
        throw new Error(`Could not connect to MongoDB: ${message}`);
    }
}
// ─── Disconnect ───────────────────────────────────────────────────────────────
async function disconnectMongoDB() {
    if (!client)
        return;
    try {
        await client.close();
        logger_1.logger.info('MongoDB disconnected gracefully.');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger_1.logger.error(`Error disconnecting from MongoDB: ${message}`);
    }
    finally {
        client = null;
        db = null;
    }
}
// ─── Accessor ─────────────────────────────────────────────────────────────────
/**
 * Returns the MongoDB Db instance.
 * Throws if connectMongoDB() has not been called first.
 */
function getMongoDb() {
    if (!db) {
        throw new Error('MongoDB is not connected. Call connectMongoDB() before accessing the database.');
    }
    return db;
}
//# sourceMappingURL=mongo-connection.js.map