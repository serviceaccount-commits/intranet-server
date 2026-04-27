import { Permission } from '../../entities/Permission.entity';
import { Role } from '../../entities/Role.entity';

export interface IRoleRepository {
  create(role: Role, permissions: Permission[]): Promise<Role>;
  save(role: Role): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByIdWithParent(id: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  deleteRole(roleId: string): Promise<void>;
}
