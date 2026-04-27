import { Permission } from '../../entities/Permission.entity';

export interface IPermissionRepository {
  create(permission: Permission): Promise<Permission>;
  findById(id: string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  findAllByRoleId(roleId: string): Promise<Permission[]>;
  findAllByIds(permissionIds: string[]): Promise<Permission[]>;
}
