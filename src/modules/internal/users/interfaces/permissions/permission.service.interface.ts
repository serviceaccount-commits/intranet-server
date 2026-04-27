import { Permission } from '../../entities/Permission.entity';
import { OwnRoleAndParentPermissions } from '../../types/Roles.types';

export interface IPermissionService {
  createPermission(name: string, appModule: string): Promise<Permission>;
  getPermissions(roleId: string): Promise<Permission[]>;
  getOwnAndParentPermissions(
    roleId: string,
  ): Promise<OwnRoleAndParentPermissions>;
}
