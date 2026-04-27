import { Permission } from '../../entities/Permission.entity';

export interface ICustomFieldRepository {
  create(permission: Permission): Promise<Permission>;
  findById(id: number): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
}
