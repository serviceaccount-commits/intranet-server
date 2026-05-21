"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const logger_1 = require("../../../../shared/utils/logger");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appConfig_1 = __importDefault(require("../../../../shared/config/appConfig"));
const inversify_1 = require("inversify");
let AuthService = class AuthService {
    jwtConfig = appConfig_1.default.jwt;
    verifyEmailJwtConfig = appConfig_1.default.verifyEmailJwt;
    // -- Token Generation --
    generateAccessToken(payload) {
        const options = {
            algorithm: this.jwtConfig.algorithms[0],
            expiresIn: parseInt(this.jwtConfig.accessTokenExpiresIn),
            issuer: this.jwtConfig.issuer,
            audience: this.jwtConfig.audience,
        };
        return jsonwebtoken_1.default.sign(payload, this.jwtConfig.privateKey, options);
    }
    generateRefreshToken(payload) {
        const options = {
            algorithm: this.jwtConfig.algorithms[0],
            expiresIn: parseInt(this.jwtConfig.refreshTokenExpiresIn),
            issuer: this.jwtConfig.issuer,
            audience: this.jwtConfig.audience,
        };
        const tokenPayload = {
            id: payload.id,
            username: payload.username,
            permissions: payload.permissions,
        };
        return jsonwebtoken_1.default.sign(tokenPayload, this.jwtConfig.privateKey, options);
    }
    verifyToken(token) {
        try {
            const options = {
                algorithms: this.jwtConfig.algorithms,
                issuer: this.jwtConfig.issuer,
                audience: this.jwtConfig.audience,
            };
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtConfig.publicKey, options);
            return {
                id: decoded.id,
                username: decoded.username,
                permissions: decoded.permissions,
            };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                logger_1.logger.error('JWT Token Expired: ', error.message);
                return null;
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                logger_1.logger.error('JWT Invalid Token: ', error.message);
                return null;
            }
            return null;
        }
    }
    generateVerifyEmailToken(payload) {
        const options = {
            algorithm: this.verifyEmailJwtConfig.algorithms[0],
            expiresIn: parseInt(this.verifyEmailJwtConfig.tokenExpiresIn),
            issuer: this.verifyEmailJwtConfig.issuer,
            audience: this.verifyEmailJwtConfig.audience,
        };
        try {
            // 4. Firma y devuelve el token
            const token = jsonwebtoken_1.default.sign({
                id: payload.user_id,
                email: payload.work_email,
            }, this.verifyEmailJwtConfig.privateKey, options);
            return token;
        }
        catch (error) {
            logger_1.logger.error('Error signing the verification token:', error);
            throw new Error('Could not sign the verification token.');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, inversify_1.injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map