import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IPermissionService } from '../interfaces/permissions/permission.service.interface';
import { IPermissionRepository } from '../interfaces/permissions/permission.repository.interface';
import { Permission } from '../entities/Permission.entity';
import { AppDataSource } from '../../../../shared/database/data-source';
import { IRoleRepository } from '../interfaces/roles/role.repository.interface';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { OwnRoleAndParentPermissions } from '../types/Roles.types';

@injectable()
export class PermissionService implements IPermissionService {
  constructor(
    @inject(TYPES.IPermissionRepository)
    private permissionRepository: IPermissionRepository,
    @inject(TYPES.IRoleRepository)
    private roleRepository: IRoleRepository,
  ) {}

  async createPermission(name: string, appModule: string): Promise<Permission> {
    if (!name || !appModule) {
      throw new Error('name or module missing');
    }
    return await AppDataSource.manager.transaction(
      async (_transactionalEntityManager) => {
        const permission = new Permission();
        permission.app_module = appModule;
        return await this.permissionRepository.create(permission);
      },
    );
  }

  async getPermissions(roleId: string): Promise<Permission[]> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError('Role', roleId);
    }

    return role.permissions;
  }

  async getOwnAndParentPermissions(
    roleId: string,
  ): Promise<OwnRoleAndParentPermissions> {
    const role = await this.roleRepository.findByIdWithParent(roleId);
    if (!role) {
      throw new NotFoundError('Role', roleId);
    }

    const permissions = role.permissions;

    if (!role.parentRole) {
      return {
        rolePermissions: permissions.map(
          (permission) => permission.permission_id,
        ),
        parentPermissions: [],
      };
    }

    const parentPermissions = role.parentRole.permissions;

    const permissionsIds = permissions.map(
      (permission) => permission.permission_id,
    );
    const parentPermissionsIds = parentPermissions.map(
      (permission) => permission.permission_id,
    );

    return {
      rolePermissions: permissionsIds,
      parentPermissions: parentPermissionsIds,
    };
  }
}
