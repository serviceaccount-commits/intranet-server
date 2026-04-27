import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IPermissionService } from '../interfaces/permissions/permission.service.interface';
import { Request, Response } from 'express';

@injectable()
export class PermissionController {
  private readonly permissionService: IPermissionService;

  constructor(
    @inject(TYPES.IPermissionService) permissionService: IPermissionService,
  ) {
    this.permissionService = permissionService;
  }

  async createPermission(req: Request, res: Response) {
    try {
      const { permissionName, appModule } = req.body;
      const permission = await this.permissionService.createPermission(
        permissionName,
        appModule,
      );
      res.status(201).json(permission);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getPermissions(req: Request, res: Response) {
    const { roleId } = req.params;

    if (!roleId) {
      res.status(400).json({ message: 'Role ID is required' });
      return;
    }

    const permissions =
      await this.permissionService.getOwnAndParentPermissions(roleId);

    res.json(permissions);
  }
}
