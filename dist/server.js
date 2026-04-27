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
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const inversify_config_1 = require("./shared/config/inversify.config");
const containerTypes_1 = require("./shared/config/containerTypes");
const articleLockCleanup_1 = __importDefault(require("./modules/external/knowledgeBase/jobs/articleLockCleanup"));
const authService = inversify_config_1.container.get(containerTypes_1.TYPES.AuthService);
const httpServer = http_1.default.createServer(app_1.default);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: appConfig_1.default.frontendUrl || 'http://localhost:5173',
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
    console.log('WEBSOCKET JWT TOKEN: ', token);
    try {
        const payload = authService.verifyToken(token);
        socket.userId = payload?.id;
        console.log('SOCKET PAYLOAD: ', payload);
        next();
    }
    catch (error) {
        next(new Error('Authentication error: Invalid token.'));
    }
});
exports.io.on('connection', (socket) => {
    const userId = socket.userId;
    if (!userId) {
        console.log(`Connection attempt rejected for socket: ${socket.id}`);
        return;
    }
    console.log(`User connected with ID: ${userId}, Socket ID: ${socket.id}`);
    userSocketMap.set(userId, socket.id);
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        if (userSocketMap.get(userId) === socket.id) {
            userSocketMap.delete(userId);
        }
    });
});
// =================================================================
async function startServer() {
    try {
        console.log('Initializing data source...');
        await data_source_1.AppDataSource.initialize();
        console.log('Data source initialized successfully.');
        httpServer.listen(appConfig_1.default.port, () => {
            console.log(`🚀 Server running on port ${appConfig_1.default.port}`);
            console.log(`🔌 WebSockets initialized and listening.`);
            console.log(`🔗 Frontend URL for CORS: ${appConfig_1.default.frontendUrl || 'http://localhost:5173'}`);
        });
        articleLockCleanup_1.default.start();
        console.log('✅ Lock cleanup cron job scheduled to run every 15 minutes.');
    }
    catch (error) {
        console.error('🚨 Failed to start the server or initialize data source:');
        console.error(error);
        process.exit(1); // Exit if critical initialization fails
    }
}
startServer();
//# sourceMappingURL=server.js.map