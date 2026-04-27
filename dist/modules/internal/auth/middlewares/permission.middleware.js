"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = void 0;
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const userService = inversify_config_1.container.get(containerTypes_1.TYPES.IUserService);
const checkPermission = async (requiredPermission) => {
    return async (req, res, next) => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userPermissions = await userService.getUserPermissions(userId);
        if (userPermissions.includes(requiredPermission)) {
            next();
        }
        else {
            res
                .status(403)
                .json({
                message: 'Forbidden: You do not have the required permission.',
            });
        }
    };
};
exports.checkPermission = checkPermission;
//# sourceMappingURL=permission.middleware.js.map