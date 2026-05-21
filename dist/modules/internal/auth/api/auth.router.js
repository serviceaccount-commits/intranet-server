"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const logger_1 = require("../../../../shared/utils/logger");
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const passport_1 = __importDefault(require("passport"));
const appConfig_1 = __importDefault(require("../../../../shared/config/appConfig"));
const auth_controller_1 = require("../controllers/auth.controller");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const GOOGLE_AUTH_OPTIONS = {
    scope: ['profile', 'email'],
};
// Whitelist of allowed frontend origins for OAuth redirect (prevents open redirect attacks)
const ALLOWED_FRONTEND_ORIGINS = [
    'https://myparicus.paricus.com',
    'https://www.myparicus.paricus.com',
    'https://qa-intranet.vercel.app',
];
const resolveFrontendOrigin = (candidate) => {
    if (typeof candidate === 'string' && ALLOWED_FRONTEND_ORIGINS.includes(candidate)) {
        return candidate;
    }
    return appConfig_1.default.frontendUrl;
};
const authController = inversify_config_1.container.get(auth_controller_1.AuthController);
const authService = inversify_config_1.container.get(containerTypes_1.TYPES.AuthService);
const userService = inversify_config_1.container.get(containerTypes_1.TYPES.IUserService);
const clientService = inversify_config_1.container.get(containerTypes_1.TYPES.IClientService);
const authRouter = (0, express_1.Router)();
exports.authRouter = authRouter;
// const converter = (payload: JwtPayload | User): User | null => {
//   if (payload instanceof User) {
//     return payload as User;
//   }
//   return null;
// };
authRouter.get('/google', (req, res, next) => {
    const returnTo = resolveFrontendOrigin(req.query['returnTo']);
    passport_1.default.authenticate('google', {
        ...GOOGLE_AUTH_OPTIONS,
        state: returnTo,
    })(req, res, next);
});
authRouter.get('/google/callback', (req, res, next) => {
    const frontendOrigin = resolveFrontendOrigin(req.query['state']);
    passport_1.default.authenticate('google', {
        failureRedirect: `${frontendOrigin}/login?error=true`,
        failWithError: true,
        session: false,
    })(req, res, next);
}, async (req, res, _next) => {
    const frontendOrigin = resolveFrontendOrigin(req.query['state']);
    if (!req.user) {
        return res.redirect(`${frontendOrigin}/login?error=true`);
    }
    const userPayload = req.user;
    // const user = converter(payload);
    // if (!user) {
    //   throw new BusinessLogicError('Could not convert payload to User');
    // }
    try {
        const accessToken = authService.generateAccessToken(userPayload);
        const refreshToken = authService.generateRefreshToken(userPayload);
        const accessTokenMaxAge = 20 * 60 * 1000; // 20 minutes
        const refreshTokenMaxAge = 1 * 24 * 60 * 60 * 1000; // 1 day
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: accessTokenMaxAge,
            sameSite: 'none',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: refreshTokenMaxAge,
            sameSite: 'none',
        });
        res.redirect(`${frontendOrigin}/home`);
    }
    catch (error) {
        logger_1.logger.error('Field to generate tokens or set cookies after Google auth: ', error);
        res.redirect(`${frontendOrigin}/login?error=true`);
    }
});
authRouter.get('/me', auth_middleware_1.authenticateJWT, async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const [permissions, fullUser, clients] = await Promise.all([
            userService.getUserPermissions(user.id),
            userService.getUserById(user.id),
            clientService.getClientsByAccess(user.id),
        ]);
        const worksInIM = clients.some((client) => client.is_im);
        const worksInFLX = clients.some((client) => client.is_flx);
        res.json({
            user: {
                id: fullUser.user_id,
                username: `${fullUser.first_name} ${fullUser.last_name}`,
                worksInIM,
                worksInFLX,
            },
            permissions,
        });
    }
    catch (error) {
        next(error);
    }
});
authRouter.post('/refresh', async (req, res, next) => {
    try {
        await authController.refresh(req, res);
    }
    catch (error) {
        next(error);
    }
});
authRouter.post('/logout', async (_req, res) => {
    res.clearCookie('accessToken', {
        ...auth_middleware_1.ACCESS_TOKEN_COOKIE_OPTIONS,
        maxAge: 0,
    });
    res.clearCookie('refreshToken', {
        ...auth_middleware_1.REFRESH_TOKEN_COOKIE_OPTIONS,
        maxAge: 0,
    });
    res.sendStatus(204);
});
//# sourceMappingURL=auth.router.js.map