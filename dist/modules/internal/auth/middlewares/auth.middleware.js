"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = exports.REFRESH_TOKEN_COOKIE_OPTIONS = exports.ACCESS_TOKEN_COOKIE_OPTIONS = void 0;
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const appConfig_1 = __importDefault(require("../../../../shared/config/appConfig"));
const logger_1 = require("../../../../shared/utils/logger");
let authService;
const ACCESS_TOKEN_MAX_AGE = 20 * 60 * 1000; // 20 minutes
const REFRESH_TOKEN_MAX_AGE = 1 * 24 * 60 * 60 * 1000; // 1 day
const IS_PRODUCTION = appConfig_1.default.environment === 'production';
const COOKIE_OPTION_BASE = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'none',
};
exports.ACCESS_TOKEN_COOKIE_OPTIONS = {
    ...COOKIE_OPTION_BASE,
    maxAge: ACCESS_TOKEN_MAX_AGE,
};
exports.REFRESH_TOKEN_COOKIE_OPTIONS = {
    ...COOKIE_OPTION_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE,
};
const setNewTokens = (res, authService, payload) => {
    const accessToken = authService.generateAccessToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);
    res.cookie('accessToken', accessToken, exports.ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, exports.REFRESH_TOKEN_COOKIE_OPTIONS);
};
const renewRefreshToken = (res, authService, payload) => {
    const newRefreshToken = authService.generateRefreshToken(payload);
    res.cookie('refreshToken', newRefreshToken, exports.REFRESH_TOKEN_COOKIE_OPTIONS);
};
const clearAuthCookies = (res) => {
    res.clearCookie('accessToken', { ...exports.ACCESS_TOKEN_COOKIE_OPTIONS, maxAge: 0 });
    res.clearCookie('refreshToken', {
        ...exports.REFRESH_TOKEN_COOKIE_OPTIONS,
        maxAge: 0,
    });
};
const authenticateJWT = async (req, res, next) => {
    if (!authService) {
        authService = inversify_config_1.container.get(containerTypes_1.TYPES.AuthService);
    }
    if (res.headersSent) {
        logger_1.logger.debug('HEADERS ALREADY SENT at middleware start!');
        return;
    } // Early check
    const accessToken = req.cookies['accessToken'];
    const refreshToken = req.cookies['refreshToken'];
    // 1. Check Access Token
    if (accessToken) {
        try {
            const accessPayload = (await authService.verifyToken(accessToken));
            if (accessPayload) {
                req.user = accessPayload;
                // Check before potentially modifying headers in renewRefreshToken
                if (res.headersSent) {
                    logger_1.logger.debug('HEADERS ALREADY SENT before renewRefreshToken!');
                }
                renewRefreshToken(res, authService, accessPayload);
                if (res.headersSent) {
                    logger_1.logger.debug('HEADERS ALREADY SENT before next() after valid access!');
                }
                return next();
            }
        }
        catch (error) {
        }
    }
    // 2. Try Refresh Token
    if (refreshToken) {
        try {
            const refreshPayload = (await authService.verifyToken(refreshToken));
            if (refreshPayload) {
                // Check before potentially modifying headers in setNewTokens
                if (res.headersSent) {
                    logger_1.logger.debug('HEADERS ALREADY SENT before setNewTokens!');
                }
                setNewTokens(res, authService, refreshPayload);
                req.user = refreshPayload;
                if (res.headersSent) {
                    logger_1.logger.debug('HEADERS ALREADY SENT before next() after refresh!');
                }
                return next();
            }
            else {
                if (res.headersSent) {
                    logger_1.logger.debug('HEADERS ALREADY SENT before clearing cookies (invalid refresh)!');
                }
                clearAuthCookies(res);
                if (res.headersSent) {
                    logger_1.logger.debug('HEADERS ALREADY SENT before sending 401 (invalid refresh)!');
                }
                res
                    .status(401)
                    .json({ message: 'Session expired. Please log in again.' });
                return;
            }
        }
        catch (error) {
            logger_1.logger.error('Error VERIFYING Refresh Token:', error.message);
            if (res.headersSent) {
                logger_1.logger.debug('HEADERS ALREADY SENT before clearing cookies (refresh error)!');
            }
            clearAuthCookies(res);
            if (res.headersSent) {
                logger_1.logger.debug('HEADERS ALREADY SENT before sending 401 (refresh error)!');
            }
            res
                .status(401)
                .json({ message: 'Authentication failed. Please log in again.' });
            return;
        }
    }
    // 3. No valid tokens found
    if (res.headersSent) {
        logger_1.logger.debug('HEADERS ALREADY SENT before sending final 401!');
    } // Check specifically here
    res.status(401).json({ message: 'Unauthorized: Authentication required.' });
    return;
};
exports.authenticateJWT = authenticateJWT;
//# sourceMappingURL=auth.middleware.js.map