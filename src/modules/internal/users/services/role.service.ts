import { inject, injectable } from 'inversify';
import { IRoleRepository } from '../interfaces/roles/role.repository.interface';
import { IRoleService } from '../interfaces/roles/role.service.interface';
import { TYPES } from '../../../../shared/config/containerTypes';
import ES from '../../../../shared/types/enum/ES';
import { Role } from '../entities/Role.entity';
import { AppDataSource } from '../../../../shared/database/data-source';
import { IPermissionRepository } from '../interfaces/permissions/permission.repository.interface';
import { Permission } from '../entities/Permission.entity';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { CreateRoleInput } from '../schema/roles/CreateRoleSchema';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import { ActionNotAllowedError } from '../../../../shared/errors/ActionNotAllowedError';

@injectable()
export class RoleService implements IRoleService {
  constructor(
    @inject(TYPES.IRoleRepository) private roleRepository: IRoleRepository,
    @inject(TYPES.IPermissionRepository)
    private permissionRespository: IPermissionRepository,
  ) {}

  async createRole(
    roleName: string,
    roleStatus: ES.ACTIVE | ES.INACTIVE,
    permissionIds: string[],
  ): Promise<Role> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const permissions = await Promise.all(
        permissionIds.map(async (id) =>
          this.permissionRespository.findById(id),
        ),
      );

      if (permissions.some((p) => !p)) {
        throw new Error('One or more permission IDs are invalid.');
      }

      const newRole = new Role();
      newRole.role_name = roleName;
      newRole.role_status = roleStatus;

      const role = await this.roleRepository.create(
        newRole,
        permissions as Permission[],
      );

      return role;
    });
  }

  async getRoles(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }

  async getRoleById(roleId: string): Promise<Role> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError(`Role`, roleId);
    }
    return role;
  }

  /**
   * A derived role may never hold more than the role it was derived from, and
   * a base role is fixed.
   *
   * The Roles screen already greys out the boxes above that ceiling, but a
   * checkbox attribute is a hint, not a rule: a request made by hand went
   * straight through and could hand a role the whole catalog. This is the same
   * rule where it actually holds.
   */
  async updateRolePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    if (!Array.isArray(permissionIds)) {
      throw new BusinessLogicError('permissionIds must be an array.');
    }

    await AppDataSource.manager.transaction(async (_t) => {
      const role = await this.roleRepository.findByIdWithParent(roleId);
      if (!role) {
        throw new NotFoundError(`Role`, roleId);
      }

      if (role.is_base_role) {
        throw new ActionNotAllowedError(
          'The permissions of a base role cannot be changed.',
        );
      }

      if (!role.parentRole) {
        throw new ActionNotAllowedError(
          'This role is not derived from another role, so its permissions cannot be edited.',
        );
      }

      const requestedIds = [...new Set(permissionIds)];

      const ceiling = new Set(
        (role.parentRole.permissions || []).map((p) => p.permission_id),
      );
      const outsideCeiling = requestedIds.filter((id) => !ceiling.has(id));
      if (outsideCeiling.length > 0) {
        throw new ActionNotAllowedError(
          `Cannot grant permissions that the parent role does not have: ${outsideCeiling.join(', ')}`,
        );
      }

      const allPermissions =
        await this.permissionRespository.findAllByIds(requestedIds);
      if (allPermissions.length !== requestedIds.length) {
        const foundPermissionIds = allPermissions.map((p) => p.permission_id);
        const notFoundPermissionIds = requestedIds.filter(
          (id) => !foundPermissionIds.includes(id),
        );
        throw new NotFoundError(
          `Permissions not found: ${notFoundPermissionIds.join(', ')}`,
        );
      }

      role.permissions = allPermissions;
      await this.roleRepository.save(role);
    });
  }

  async createRoleBased(roleId: string, input: CreateRoleInput): Promise<Role> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new NotFoundError(`Role`, roleId);
      }

      const newRole = new Role();
      newRole.role_name = input.roleName;
      newRole.description = input.roleDescription;
      newRole.permissions = role.permissions;
      newRole.parent_role_id = roleId;
      if (role.is_base_role) {
        newRole.base_role_id = roleId;
      } else {
        newRole.base_role_id = role.base_role_id;
      }

      return await this.roleRepository.create(newRole, role.permissions);
    });
  }

  async deleteRole(roleId: string): Promise<void> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError(`Role`, roleId);
    }

    if (role.users.length > 0) {
      throw new BusinessLogicError(`Role ${roleId} has users assigned to it.`);
    }

    if (role.is_base_role) {
      throw new BusinessLogicError(`Role ${roleId} is a base role.`);
    }

    await this.roleRepository.deleteRole(roleId);
  }
}
