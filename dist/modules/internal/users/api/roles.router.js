"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesRouter = void 0;
const express_1 = require("express");
const roles_controller_1 = require("../controllers/roles.controller");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const permissions_controller_1 = require("../controllers/permissions.controller");
const roleController = inversify_config_1.container.get(roles_controller_1.RoleController);
const permissionController = inversify_config_1.container.get(permissions_controller_1.PermissionController);
const rolesRouter = (0, express_1.Router)();
exports.rolesRouter = rolesRouter;
rolesRouter.get('/:roleId/permissions', async (req, res, next) => {
    try {
        await permissionController.getPermissions(req, res);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.post('/permissions', async (req, res, next) => {
    try {
        await permissionController.createPermission(req, res);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.put('/:roleId/permissions', async (req, res, next) => {
    try {
        await roleController.updateRolePermissions(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.post('/', async (req, res, next) => {
    try {
        await roleController.createRole(req, res);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.post('/based/:roleId', async (req, res, next) => {
    try {
        await roleController.createRoleBased(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.get('/', async (req, res, next) => {
    try {
        await roleController.getRoles(req, res);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.get('/:roleId', async (req, res, next) => {
    try {
        await roleController.getRoleDetails(req, res);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.delete('/:roleId', async (req, res, next) => {
    try {
        await roleController.deleteRole(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=roles.router.js.map