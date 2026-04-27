import { injectable } from 'inversify';
import { Permission } from '../entities/Permission.entity';
import { AppDataSource } from '../../../../shared/database/data-source';
import { IPermissionRepository } from '../interfaces/permissions/permission.repository.interface';
import { In } from 'typeorm';

@injectable()
export class PermissionRepository implements IPermissionRepository {
  async create(permission: Permission): Promise<Permission> {
    return await AppDataSource.manager.save(permission);
  }

  async findById(id: string): Promise<Permission | null> {
    return await AppDataSource.manager.findOne(Permission, {
      where: { permission_id: id },
    });
  }

  async findAll(): Promise<Permission[]> {
    return await AppDataSource.manager.find(Permission);
  }

  async findAllByRoleId(roleId: string): Promise<Permission[]> {
    return await AppDataSource.manager
      .createQueryBuilder(Permission, 'p')
      .leftJoin('p.roles', 'r')
      .where('r.role_id = :roleId', { roleId })
      .getMany();
  }

  async findAllByIds(permissionIds: string[]): Promise<Permission[]> {
    return await AppDataSource.manager.find(Permission, {
      where: { permission_id: In(permissionIds) },
    });
  }
}
