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
let userController;
const usersRouter = (0, express_1.Router)();
exports.usersRouter = usersRouter;
usersRouter.post('/', async (req, res, next) => {
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
usersRouter.get('/', auth_middleware_1.authenticateJWT, async (req, res, next) => {
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
usersRouter.get('/profile/:userId', async (req, res, next) => {
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
usersRouter.put('/:userId', async (req, res, next) => {
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
usersRouter.delete('/:userId', async (req, res, next) => {
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