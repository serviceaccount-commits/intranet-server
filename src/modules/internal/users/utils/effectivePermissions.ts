import { User } from '../entities/User.entity';

/**
 * Everything a person may do: the permissions of their main role plus those of
 * every additional role. Load `role.permissions` and
 * `additionalRoles.permissions` before calling it.
 */
export const effectivePermissionIds = (user: User | null | undefined): string[] => {
  if (!user) return [];
  const ids = new Set<string>();
  for (const p of user.role?.permissions ?? []) ids.add(p.permission_id);
  for (const role of user.additionalRoles ?? []) {
    for (const p of role.permissions ?? []) ids.add(p.permission_id);
  }
  return [...ids];
};
