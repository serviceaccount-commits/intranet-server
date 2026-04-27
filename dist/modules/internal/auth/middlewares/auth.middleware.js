"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = exports.REFRESH_TOKEN_COOKIE_OPTIONS = exports.ACCESS_TOKEN_COOKIE_OPTIONS = void 0;
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const appConfig_1 = __importDefault(require("../../../../shared/config/appConfig"));
let authService;
const ACCESS_TOKEN_MAX_AGE = 20 * 60 * 1000; // 20 minutes
const REFRESH_TOKEN_MAX_AGE = 1 * 24 * 60 * 60 * 1000; // 1 day
const IS_PRODUCTION = appConfig_1.default.environment === 'production';
const COOKIE_OPTION_BASE = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
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
    console.log('New tokens set (Access & Refresh)');
};
const renewRefreshToken = (res, authService, payload) => {
    const newRefreshToken = authService.generateRefreshToken(payload);
    res.cookie('refreshToken', newRefreshToken, exports.REFRESH_TOKEN_COOKIE_OPTIONS);
    console.log('Refresh token renewed (sliding session');
};
const clearAuthCookies = (res) => {
    res.clearCookie('accessToken', { ...exports.ACCESS_TOKEN_COOKIE_OPTIONS, maxAge: 0 });
    res.clearCookie('refreshToken', {
        ...exports.REFRESH_TOKEN_COOKIE_OPTIONS,
        maxAge: 0,
    });
    console.log('Auth cookies cleared');
};
const authenticateJWT = async (req, res, next) => {
    console.log('--- Authenticate JWT Start ---');
    if (!authService) {
        authService = inversify_config_1.container.get(containerTypes_1.TYPES.AuthService);
    }
    if (res.headersSent) {
        console.error('HEADERS ALREADY SENT at middleware start!');
        return;
    } // Early check
    const accessToken = req.cookies['accessToken'];
    const refreshToken = req.cookies['refreshToken'];
    console.log(`Access Token Present: ${!!accessToken}`);
    console.log(`Refresh Token Present: ${!!refreshToken}`);
    console.log(accessToken);
    console.log(refreshToken);
    // 1. Check Access Token
    if (accessToken) {
        try {
            const accessPayload = (await authService.verifyToken(accessToken));
            if (accessPayload) {
                console.log('Access Token VALID');
                req.user = accessPayload;
                // Check before potentially modifying headers in renewRefreshToken
                if (res.headersSent) {
                    console.error('HEADERS ALREADY SENT before renewRefreshToken!');
                }
                renewRefreshToken(res, authService, accessPayload);
                console.log('Calling next() after valid access token.');
                if (res.headersSent) {
                    console.error('HEADERS ALREADY SENT before next() after valid access!');
                }
                return next();
            }
            console.log('Access Token INVALID/EXPIRED');
        }
        catch (error) {
            console.log('Access Token VERIFICATION FAILED:', error.message);
        }
    }
    // 2. Try Refresh Token
    if (refreshToken) {
        console.log('Attempting refresh with Refresh Token...');
        try {
            const refreshPayload = (await authService.verifyToken(refreshToken));
            if (refreshPayload) {
                console.log('Refresh Token VALID. Setting new tokens.');
                // Check before potentially modifying headers in setNewTokens
                if (res.headersSent) {
                    console.error('HEADERS ALREADY SENT before setNewTokens!');
                }
                setNewTokens(res, authService, refreshPayload);
                req.user = refreshPayload;
                console.log('Calling next() after successful refresh.');
                if (res.headersSent) {
                    console.error('HEADERS ALREADY SENT before next() after refresh!');
                }
                return next();
            }
            else {
                console.log('Refresh Token INVALID or EXPIRED by verification logic.');
                if (res.headersSent) {
                    console.error('HEADERS ALREADY SENT before clearing cookies (invalid refresh)!');
                }
                clearAuthCookies(res);
                if (res.headersSent) {
                    console.error('HEADERS ALREADY SENT before sending 401 (invalid refresh)!');
                }
                res
                    .status(401)
                    .json({ message: 'Session expired. Please log in again.' });
                console.log('--- Authenticate JWT Failed (Refresh Invalid) ---');
                return;
            }
        }
        catch (error) {
            console.error('Error VERIFYING Refresh Token:', error.message);
            if (res.headersSent) {
                console.error('HEADERS ALREADY SENT before clearing cookies (refresh error)!');
            }
            clearAuthCookies(res);
            if (res.headersSent) {
                console.error('HEADERS ALREADY SENT before sending 401 (refresh error)!');
            }
            res
                .status(401)
                .json({ message: 'Authentication failed. Please log in again.' });
            console.log('--- Authenticate JWT Failed (Refresh Error) ---');
            return;
        }
    }
    // 3. No valid tokens found
    console.log('No valid access or refresh token found.');
    if (res.headersSent) {
        console.error('HEADERS ALREADY SENT before sending final 401!');
    } // Check specifically here
    res.status(401).json({ message: 'Unauthorized: Authentication required.' });
    console.log('--- Authenticate JWT Failed (No Tokens) ---');
    return;
};
exports.authenticateJWT = authenticateJWT;
//# sourceMappingURL=auth.middleware.js.map