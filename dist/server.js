"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSocketMap = exports.io = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const appConfig_1 = __importDefault(require("./shared/config/appConfig"));
const data_source_1 = require("./shared/database/data-source");
const mongo_connection_1 = require("./shared/database/mongo-connection");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const inversify_config_1 = require("./shared/config/inversify.config");
const containerTypes_1 = require("./shared/config/containerTypes");
const articleLockCleanup_1 = __importDefault(require("./modules/external/knowledgeBase/jobs/articleLockCleanup"));
const logger_1 = require("./shared/utils/logger");
const authService = inversify_config_1.container.get(containerTypes_1.TYPES.AuthService);
const httpServer = http_1.default.createServer(app_1.default);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: [
            appConfig_1.default.frontendUrl || 'http://localhost:5173',
            'https://myparicus.paricus.com',
            'https://www.myparicus.paricus.com',
            'https://portal.paricus.com',
            'https://qa-portal.paricus.com',
            'https://qa-intranet.vercel.app',
            'http://localhost:5173',
            'http://localhost:5174',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
exports.io.use(wrap((0, cookie_parser_1.default)()));
const userSocketMap = new Map();
exports.userSocketMap = userSocketMap;
exports.io.use((socket, next) => {
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
    }
    catch (error) {
        next(new Error('Authentication error: Invalid token.'));
    }
});
exports.io.on('connection', (socket) => {
    const userId = socket.userId;
    if (!userId) {
        logger_1.logger.warn(`WebSocket connection rejected — no userId on socket ${socket.id}`);
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
        logger_1.logger.info('Initializing PostgreSQL data source...');
        await data_source_1.AppDataSource.initialize();
        logger_1.logger.info('PostgreSQL connected successfully.');
        logger_1.logger.info('Initializing MongoDB connection...');
        await (0, mongo_connection_1.connectMongoDB)(appConfig_1.default.mongodb.uri, appConfig_1.default.mongodb.dbName);
        httpServer.listen(appConfig_1.default.port, () => {
            logger_1.logger.info(`Server running on port ${appConfig_1.default.port}`);
            logger_1.logger.info(`WebSockets initialized and listening.`);
            logger_1.logger.info(`Frontend URL for CORS: ${appConfig_1.default.frontendUrl || 'http://localhost:5173'}`);
        });
        articleLockCleanup_1.default.start();
        logger_1.logger.info('Lock cleanup cron job scheduled to run every 15 minutes.');
        const shutdown = async (signal) => {
            logger_1.logger.info(`${signal} received — shutting down gracefully...`);
            await (0, mongo_connection_1.disconnectMongoDB)();
            await data_source_1.AppDataSource.destroy();
            process.exit(0);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        logger_1.logger.error('Failed to start the server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map