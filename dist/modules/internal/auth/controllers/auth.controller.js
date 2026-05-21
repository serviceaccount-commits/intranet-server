"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const logger_1 = require("../../../../shared/utils/logger");
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const auth_service_1 = require("../services/auth.service");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    // public async login(req: Request, res: Response) {}
    async refresh(req, res) {
        const refreshToken = req.cookies['refreshToken'];
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not found' });
        }
        try {
            const payload = this.authService.verifyToken(refreshToken); //
            if (!payload) {
                res.clearCookie('accessToken');
                res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
                return res
                    .status(403)
                    .json({ message: 'Invalid or expired refresh token' });
            }
            const newAccessTokenPayload = {
                id: payload.id,
                username: payload.username,
                permissions: payload.permissions,
            };
            const newAccessToken = this.authService.generateAccessToken(newAccessTokenPayload);
            const accessTokenMaxAge = 20 * 60 * 1000; // 20 minutes
            // 4. Set the new access token in the cookie
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: true,
                maxAge: accessTokenMaxAge,
                sameSite: 'none',
            });
            res.status(200).json({ message: 'Access token refreshed' });
        }
        catch (error) {
            logger_1.logger.error('Error refreshing token:', error);
            res.status(500).json({ message: 'Could not refresh token' });
        }
    }
    async logout(_req, res) {
        res.status(200).json({ message: 'Logged out successfully' });
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.AuthService)),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map