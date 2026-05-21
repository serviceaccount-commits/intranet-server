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
exports.verifyApiKey = void 0;
const logger_1 = require("../../../../shared/utils/logger");
const crypto = __importStar(require("crypto"));
const appConfig_1 = __importDefault(require("../../../../shared/config/appConfig"));
const API_KEY = appConfig_1.default.internalApiKey;
const verifyApiKey = async (req, res, next) => {
    if (!API_KEY) {
        // This is a server configuration error, not a client error.
        logger_1.logger.error('INTERNAL_API_KEY is not set in environment variables.');
        res.status(500).json({ message: 'Internal Server Error' });
        return;
    }
    const clientApiKey = req.header('X-API-Key');
    if (!clientApiKey) {
        res.status(401).json({ message: 'Unauthorized: API key is missing.' });
        return;
    }
    if (clientApiKey.length !== API_KEY.length) {
        res.status(401).json({ message: 'Unauthorized: Invalid API key.' });
        return;
    }
    // Use crypto.timingSafeEqual to prevent timing attacks
    const isVerified = crypto.timingSafeEqual(Buffer.from(clientApiKey), Buffer.from(API_KEY));
    if (isVerified) {
        next(); // Key is valid, proceed to the route handler.
    }
    else {
        res.status(401).json({ message: 'Unauthorized: Invalid API key.' });
        return;
    }
};
exports.verifyApiKey = verifyApiKey;
//# sourceMappingURL=apiKey.middleware.js.map