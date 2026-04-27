import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import { setupKbCollections } from '../../modules/external/knowledgeBase/database/kb-collections';
import { logger } from '../utils/logger';

// ─── Singleton ────────────────────────────────────────────────────────────────

let client: MongoClient | null = null;
let db: Db | null = null;

// ─── Connect ─────────────────────────────────────────────────────────────────

export async function connectMongoDB(uri: string, dbName: string): Promise<void> {
  if (client && db) {
    logger.debug('MongoDB: already connected, reusing existing connection.');
    return;
  }

  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
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

    logger.info(`MongoDB connected — database: "${dbName}"`);

    await setupKbCollections(db);

    client.on('close', () => {
      logger.warn('MongoDB connection closed unexpectedly.');
      client = null;
      db = null;
    });

    client.on('error', (error: Error) => {
      logger.error('MongoDB client error:', error.message);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`MongoDB connection failed: ${message}`);

    // Clean up on failure so the next attempt starts fresh
    await client?.close().catch(() => {});
    client = null;
    db = null;

    throw new Error(`Could not connect to MongoDB: ${message}`);
  }
}

// ─── Disconnect ───────────────────────────────────────────────────────────────

export async function disconnectMongoDB(): Promise<void> {
  if (!client) return;

  try {
    await client.close();
    logger.info('MongoDB disconnected gracefully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Error disconnecting from MongoDB: ${message}`);
  } finally {
    client = null;
    db = null;
  }
}

// ─── Accessor ─────────────────────────────────────────────────────────────────

/**
 * Returns the MongoDB Db instance.
 * Throws if connectMongoDB() has not been called first.
 */
export function getMongoDb(): Db {
  if (!db) {
    throw new Error(
      'MongoDB is not connected. Call connectMongoDB() before accessing the database.',
    );
  }
  return db;
}
