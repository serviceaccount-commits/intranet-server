"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const users_controller_1 = __importDefault(require("../controllers/users.controller"));
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const auth_middleware_1 = require("../../auth/middlewares/auth.middleware");
const permission_middleware_1 = require("../../auth/middlewares/permission.middleware");
let userController;
const usersRouter = (0, express_1.Router)();
exports.usersRouter = usersRouter;
// Creating, editing and deleting people is the Staff Directory's
// administrative ability. Announcements reaches the same endpoint from its own
// screen, so both go through the one permission that governs it.
const canAdminUsers = (0, permission_middleware_1.checkPermission)('directory:user:create');
// Reading the user list feeds the directory itself and the recipient pickers of
// Announcements — accept whichever module the caller actually holds.
const canListUsers = (0, permission_middleware_1.checkAnyPermission)('directory:list', 'directory:access', 'announcements:access');
// Someone always gets to read and edit their own record; everyone else needs
// the directory permission.
const canReadProfile = (0, permission_middleware_1.checkSelfOrPermission)('userId', 'directory:profile:access');
const canEditUser = (0, permission_middleware_1.checkSelfOrPermission)('userId', 'directory:user:create');
usersRouter.post('/', canAdminUsers, async (req, res, next) => {
    try {
        if (!userController) {
            userController = inversify_config_1.container.get(users_controller_1.default);
        }
        await userController.createUser(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Self-service: every signed-in user reports their own activity and closes
// their own onboarding, so these stay open to anyone authenticated.
usersRouter.post('/last-activity', async (req, res, next) => {
    try {
        if (!userController) {
            userController = inversify_config_1.container.get(users_controller_1.default);
        }
        await userController.updateLastActivity(req, res);
    }
    catch (error) {
        next(error);
    }
});
usersRouter.post('/onboarding-completed', async (req, res, next) => {
    try {
        if (!userController) {
            userController = inversify_config_1.container.get(users_controller_1.default);
        }
        await userController.completeOnboarding(req, res);
    }
    catch (error) {
        next(error);
    }
});
usersRouter.get('/', auth_middleware_1.authenticateJWT, canListUsers, async (req, res, next) => {
    try {
        if (!userController) {
            userController = inversify_config_1.container.get(users_controller_1.default);
        }
        await userController.getUsers(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
// The home page ranking: shown to everyone who can log in.
usersRouter.get('/sheet-data/:sheetOption', async (req, res, next) => {
    try {
        if (!userController) {
            userController = inversify_config_1.container.get(users_controller_1.default);
        }
        await userController.getSheetData(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
usersRouter.get('/profile/:userId', canReadProfile, async (req, res, next) => {
    try {
        if (!userController) {
            userController = inversify_config_1.container.get(users_controller_1.default);
        }
        await userController.getUserProfileById(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Three segments, so it never collides with '/profile/:userId' above.
usersRouter.get('/profile/me/profile', async (req, res, next) => {
    try {
        if (!userController) {
            userController = inversify_config_1.container.get(users_controller_1.default);
        }
        await userController.getMyUserProfile(req, res);
    }
    catch (error) {
        next(error);
    }
});
usersRouter.put('/:userId', canEditUser, async (req, res, next) => {
    try {
        if (!userController) {
            userController = inversify_config_1.container.get(users_controller_1.default);
        }
        await userController.updateUser(req, res);
    }
    catch (error) {
        next(error);
    }
});
usersRouter.delete('/:userId', canAdminUsers, async (req, res, next) => {
    try {
        if (!userController) {
            userController = inversify_config_1.container.get(users_controller_1.default);
        }
        await userController.deleteUser(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=users.router.js.map