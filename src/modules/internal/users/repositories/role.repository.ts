import { AppDataSource } from '../../../../shared/database/data-source';
import { Permission } from '../entities/Permission.entity';
import { Role } from '../entities/Role.entity';
import { IRoleRepository } from '../interfaces/roles/role.repository.interface';
import { injectable } from 'inversify';

@injectable()
export class RoleRepository implements IRoleRepository {
  async create(role: Role, permissions: Permission[]): Promise<Role> {
    role.permissions = permissions;

    return await AppDataSource.manager.save(role);
  }
  async save(role: Role): Promise<Role> {
    return await AppDataSource.manager.save(role);
  }

  async findById(id: string): Promise<Role | null> {
    return await AppDataSource.manager.findOne(Role, {
      where: { role_id: id },
      relations: {
        permissions: true,
        users: true,
        baseRole: true,
        parentRole: true,
      },
    });
  }

  async findByIdWithParent(id: string): Promise<Role | null> {
    return await AppDataSource.manager.findOne(Role, {
      where: { role_id: id },
      relations: {
        permissions: true,
        parentRole: { permissions: true },
      },
    });
  }

  async findAll(): Promise<Role[]> {
    return await AppDataSource.manager
      .createQueryBuilder(Role, 'role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('role.users', 'users')
      .leftJoinAndSelect('role.baseRole', 'baseRole')
      .leftJoinAndSelect('role.parentRole', 'parentRole')
      .getMany();
  }

  async deleteRole(roleId: string): Promise<void> {
    await AppDataSource.manager.delete(Role, { role_id: roleId });
  }
}
