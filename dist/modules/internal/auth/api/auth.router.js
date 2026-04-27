"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
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
authRouter.get('/google', passport_1.default.authenticate('google', GOOGLE_AUTH_OPTIONS));
authRouter.get('/google/callback', passport_1.default.authenticate('google', {
    failureRedirect: `${appConfig_1.default.frontendUrl}/login?error=true`,
    failWithError: true,
    session: false,
}), async (req, res, _next) => {
    console.log('whaatt');
    if (!req.user) {
        return res.redirect(`${appConfig_1.default.frontendUrl}/login?error=true`);
    }
    const userPayload = req.user;
    // const user = converter(payload);
    // if (!user) {
    //   throw new BusinessLogicError('Could not convert payload to User');
    // }
    try {
        console.log('lets see: ', userPayload);
        const accessToken = authService.generateAccessToken(userPayload);
        console.log('It works');
        const refreshToken = authService.generateRefreshToken(userPayload);
        const accessTokenMaxAge = 20 * 60 * 1000; // 20 minutes
        const refreshTokenMaxAge = 1 * 24 * 60 * 60 * 1000; // 1 day
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            maxAge: accessTokenMaxAge,
            sameSite: 'lax',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            maxAge: refreshTokenMaxAge,
            sameSite: 'lax',
        });
        console.log('Tokens set in cookies, redirecting to frontend.');
        res.redirect(`${appConfig_1.default.frontendUrl}/home`);
    }
    catch (error) {
        console.error('Field to generate tokens or set cookies after Google auth: ', error);
        res.redirect(`${appConfig_1.default.frontendUrl}/login?error=true`);
    }
});
authRouter.get('/me', auth_middleware_1.authenticateJWT, async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const permissions = await userService.getUserPermissions(user.id);
    const fullUser = await userService.getUserById(user.id);
    const clients = await clientService.getClientsByAccess(user.id);
    const worksInIM = clients.findIndex((client) => client.is_im) !== -1;
    const worksInFLX = clients.findIndex((client) => client.is_flx) !== -1;
    res.json({
        user: {
            id: fullUser.user_id,
            username: fullUser.first_name + ' ' + fullUser.last_name,
            worksInIM: worksInIM,
            worksInFLX: worksInFLX,
        },
        permissions: permissions,
    });
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
    console.log('Logging out');
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