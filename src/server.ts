import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import app from './app';
import appConfig from './shared/config/appConfig';
import { AppDataSource } from './shared/database/data-source';
import { connectMongoDB, disconnectMongoDB } from './shared/database/mongo-connection';
import cookieParser from 'cookie-parser';
import { AuthService } from './modules/internal/auth/services/auth.service';
import { container } from './shared/config/inversify.config';
import { TYPES } from './shared/config/containerTypes';
import articleLockCleanupJob from './modules/external/knowledgeBase/jobs/articleLockCleanup';
import { ServerToClientEvents } from './shared/types/socket-types';
import { logger } from './shared/utils/logger';

const authService = container.get<AuthService>(TYPES.AuthService);

const httpServer = http.createServer(app);

export const io = new SocketIOServer<ServerToClientEvents>(httpServer, {
  cors: {
    origin: [
      appConfig.frontendUrl || 'http://localhost:5173',
      'https://myparicus.paricus.com',
      'https://www.myparicus.paricus.com',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const wrap = (middleware: any) => (socket: Socket, next: any) =>
  middleware(socket.request, {}, next);
io.use(wrap(cookieParser()));

const userSocketMap = new Map<string, string>();

io.use((socket: any, next) => {
  const token = socket.request.cookies?.accessToken;
  if (!token) {
    return next(new Error('Authentication error: Token cookie not found'));
  }
  try {
    const payload = authService.verifyToken(token);
    if (!payload?.id) {
      return next(new Error('Authentication error: Invalid token payload.'));
    }
    socket.userId = payload.id;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token.'));
  }
});

io.on('connection', (socket: any) => {
  const userId = socket.userId;

  if (!userId) {
    logger.warn(`WebSocket connection rejected — no userId on socket ${socket.id}`);
    return;
  }

  userSocketMap.set(userId, socket.id);

  socket.on('disconnect', () => {
    if (userSocketMap.get(userId) === socket.id) {
      userSocketMap.delete(userId);
    }
  });
});
// =================================================================

async function startServer() {
  try {
    logger.info('Initializing PostgreSQL data source...');
    await AppDataSource.initialize();
    logger.info('PostgreSQL connected successfully.');

    logger.info('Initializing MongoDB connection...');
    await connectMongoDB(appConfig.mongodb.uri, appConfig.mongodb.dbName);

    httpServer.listen(appConfig.port, () => {
      logger.info(`Server running on port ${appConfig.port}`);
      logger.info(`WebSockets initialized and listening.`);
      logger.info(`Frontend URL for CORS: ${appConfig.frontendUrl || 'http://localhost:5173'}`);
    });

    articleLockCleanupJob.start();
    logger.info('Lock cleanup cron job scheduled to run every 15 minutes.');

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully...`);
      await disconnectMongoDB();
      await AppDataSource.destroy();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start the server:', error);
    process.exit(1);
  }
}

startServer();

export { userSocketMap };
