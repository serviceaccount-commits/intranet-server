import ES from '../../../../../shared/types/enum/ES';
import { Role } from '../../entities/Role.entity';
import { CreateRoleInput } from '../../schema/roles/CreateRoleSchema';

export interface IRoleService {
  createRole(
    role: string,
    roleStatus: ES.ACTIVE | ES.INACTIVE,
    permissionIds: string[],
  ): Promise<Role>;

  createRoleBased(roleId: string, input: CreateRoleInput): Promise<Role>;

  getRoles(): Promise<Role[]>;

  getRoleById(roleId: string): Promise<Role>;

  updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void>;

  deleteRole(roleId: string): Promise<void>;
}
