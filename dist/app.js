"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const appConfig_1 = __importDefault(require("./shared/config/appConfig"));
const api_router_1 = __importDefault(require("./api-layer/api.router"));
const passport_config_1 = require("./shared/config/passport.config");
const passport_1 = __importDefault(require("passport"));
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '25mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
app.use(express_1.default.text({ limit: '25mb' }));
app.use((0, cookie_parser_1.default)());
const frontendOrigin = appConfig_1.default.frontendUrl || 'http://localhost:5173';
const corsOptions = {
    origin: [
        frontendOrigin,
        'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:8080',
        'http://localhost:4200',
        'http://localhost:5173',
    ],
    credentials: true,
    exposedHeaders: ['Content-Disposition', 'Content-Type'],
};
app.use((0, cors_1.default)(corsOptions));
(0, passport_config_1.configurePassport)();
app.use(passport_1.default.initialize());
if (appConfig_1.default.environment === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
app.use('/api', api_router_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map