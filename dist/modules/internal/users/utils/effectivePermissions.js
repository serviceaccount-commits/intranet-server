"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.effectivePermissionIds = void 0;
/**
 * Everything a person may do: the permissions of their main role plus those of
 * every additional role. Load `role.permissions` and
 * `additionalRoles.permissions` before calling it.
 */
const effectivePermissionIds = (user) => {
    if (!user)
        return [];
    const ids = new Set();
    for (const p of user.role?.permissions ?? [])
        ids.add(p.permission_id);
    for (const role of user.additionalRoles ?? []) {
        for (const p of role.permissions ?? [])
            ids.add(p.permission_id);
    }
    return [...ids];
};
exports.effectivePermissionIds = effectivePermissionIds;
//# sourceMappingURL=effectivePermissions.js.map