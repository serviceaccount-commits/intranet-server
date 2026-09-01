"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesRouter = void 0;
const express_1 = require("express");
const roles_controller_1 = require("../controllers/roles.controller");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const permissions_controller_1 = require("../controllers/permissions.controller");
const permission_middleware_1 = require("../../auth/middlewares/permission.middleware");
const roleController = inversify_config_1.container.get(roles_controller_1.RoleController);
const permissionController = inversify_config_1.container.get(permissions_controller_1.PermissionController);
const rolesRouter = (0, express_1.Router)();
exports.rolesRouter = rolesRouter;
// Anything that hands out abilities is behind `roles:manage`. Without it any
// authenticated user — a Viewer included — could call these by hand and grant
// themselves the whole catalog.
const canManageRoles = (0, permission_middleware_1.checkPermission)('roles:manage');
const canReadRoles = (0, permission_middleware_1.checkPermission)('roles:access');
// The plain role list is a lookup, not a management screen: Announcements and
// the Staff Directory both use it to fill their filters. Gating it on
// `roles:access` alone would break those pages, so any module that legitimately
// needs the names is accepted.
const canListRoles = (0, permission_middleware_1.checkAnyPermission)('roles:access', 'announcements:access', 'directory:access');
rolesRouter.get('/:roleId/permissions', canReadRoles, async (req, res, next) => {
    try {
        await permissionController.getPermissions(req, res);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.post('/permissions', canManageRoles, async (req, res, next) => {
    try {
        await permissionController.createPermission(req, res);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.put('/:roleId/permissions', canManageRoles, async (req, res, next) => {
    try {
        await roleController.updateRolePermissions(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.post('/', canManageRoles, async (req, res, next) => {
    try {
        await roleController.createRole(req, res);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.post('/based/:roleId', canManageRoles, async (req, res, next) => {
    try {
        await roleController.createRoleBased(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.get('/', canListRoles, async (req, res, next) => {
    try {
        await roleController.getRoles(req, res);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.get('/:roleId', canReadRoles, async (req, res, next) => {
    try {
        await roleController.getRoleDetails(req, res);
    }
    catch (error) {
        next(error);
    }
});
rolesRouter.delete('/:roleId', canManageRoles, async (req, res, next) => {
    try {
        await roleController.deleteRole(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=roles.router.js.map