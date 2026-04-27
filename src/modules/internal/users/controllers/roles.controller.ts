import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IRoleService } from '../interfaces/roles/role.service.interface';
import { TYPES } from '../../../../shared/config/containerTypes';
import { AppError } from '../../../../shared/errors/AppError';
import { CreateRoleInput } from '../schema/roles/CreateRoleSchema';

@injectable()
export class RoleController {
  constructor(@inject(TYPES.IRoleService) private roleService: IRoleService) {}

  async createRole(req: Request, res: Response) {
    let { roleName, roleStatus, permissionIds } = req.body;

    const newRole = await this.roleService.createRole(
      roleName,
      roleStatus,
      permissionIds,
    );

    res.json(newRole);
  }

  async createRoleBased(req: Request, res: Response, next: NextFunction) {
    const { roleId } = req.params;
    const input: CreateRoleInput = req.body;

    if (!roleId) {
      res.status(400).json({ message: 'Role ID id required' });
      return;
    }
    try {
      const role = await this.roleService.createRoleBased(roleId, input);
      res.json(role);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async getRoles(_req: Request, res: Response) {
    const roles = await this.roleService.getRoles();

    res.json(roles);
  }

  async getRoleDetails(req: Request, res: Response) {
    const { roleId } = req.params;

    if (!roleId) {
      res.status(400).json({ message: 'Role ID is required' });
      return;
    }

    const role = await this.roleService.getRoleById(roleId);

    res.json(role);
  }

  async updateRolePermissions(req: Request, res: Response, next: NextFunction) {
    const { roleId } = req.params;
    const { permissionIds } = req.body;

    if (!roleId || permissionIds === undefined) {
      res
        .status(400)
        .json({ message: 'Role ID and permission IDs are required' });
      return;
    }
    try {
      await this.roleService.updateRolePermissions(roleId, permissionIds);
      res.sendStatus(200);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction) {
    const { roleId } = req.params;

    if (!roleId) {
      res.status(400).json({ message: 'Role ID is required' });
      return;
    }
    try {
      await this.roleService.deleteRole(roleId);
      res.sendStatus(200);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}
