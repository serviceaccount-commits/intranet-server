"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSelfOrPermission = exports.checkAnyPermission = exports.checkPermission = void 0;
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const logger_1 = require("../../../../shared/utils/logger");
/**
 * Authorization for the internal (JWT) API.
 *
 * `authenticateJWT` only proves WHO the caller is; these guards decide WHAT
 * they may do. Until they were mounted the whole `/api/v1` surface was open to
 * any authenticated user, so the permission catalog only ever hid menu entries
 * in the browser — a hand-made request still went through.
 *
 * Two deliberate choices:
 *
 * - Permissions are read from the database on every check, not from the JWT.
 *   The access token lives 20 minutes and the refresh token a full day, so a
 *   token minted before a role change would keep granting an ability that has
 *   already been revoked.
 * - The container is resolved lazily. Reaching for it while this module is
 *   being imported runs before the bindings are registered and crashes boot.
 */
let userService;
const permissionsOf = (userId) => {
    if (!userService) {
        userService = inversify_config_1.container.get(containerTypes_1.TYPES.IUserService);
    }
    return userService.getUserPermissions(userId);
};
const deny = (res) => res
    .status(403)
    .json({ message: 'Forbidden: You do not have the required permission.' });
const guard = (required, matches) => async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const granted = await permissionsOf(userId);
        if (matches(granted)) {
            next();
            return;
        }
        logger_1.logger.warn(`Permission denied: user ${userId} on ${req.method} ${req.originalUrl} (needs ${required.join(' or ')})`);
        deny(res);
    }
    catch (error) {
        // Fail closed: if we cannot establish what the caller may do, they may
        // not do it. A lookup that blows up must never read as "allowed".
        logger_1.logger.error('Permission check failed:', error);
        deny(res);
    }
};
/** Requires the permission. */
const checkPermission = (required) => guard([required], (granted) => granted.includes(required));
exports.checkPermission = checkPermission;
/**
 * Requires at least one of the permissions (OR). Use it for lookups shared by
 * several modules — the role list, for instance, feeds the Roles screen but
 * also the filters of Announcements and the Staff Directory.
 */
const checkAnyPermission = (...required) => guard(required, (granted) => required.some((p) => granted.includes(p)));
exports.checkAnyPermission = checkAnyPermission;
/**
 * Lets the caller act on their own record, and otherwise falls back to the
 * permission. Keeps self-service endpoints working without handing out the
 * administrative ability to everyone.
 */
const checkSelfOrPermission = (param, required) => {
    const fallback = (0, exports.checkPermission)(required);
    return (req, res, next) => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (req.params[param] === userId) {
            next();
            return;
        }
        fallback(req, res, next);
    };
};
exports.checkSelfOrPermission = checkSelfOrPermission;
//# sourceMappingURL=permission.middleware.js.map