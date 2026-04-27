import { Router, Request, Response, NextFunction } from 'express';
import { RoleController } from '../controllers/roles.controller';
import { container } from '../../../../shared/config/inversify.config';
import { PermissionController } from '../controllers/permissions.controller';

const roleController = container.get<RoleController>(RoleController);
const permissionController =
  container.get<PermissionController>(PermissionController);

const rolesRouter = Router();

rolesRouter.get(
  '/:roleId/permissions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await permissionController.getPermissions(req, res);
    } catch (error) {
      next(error);
    }
  },
);

rolesRouter.post(
  '/permissions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await permissionController.createPermission(req, res);
    } catch (error) {
      next(error);
    }
  },
);

rolesRouter.put(
  '/:roleId/permissions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await roleController.updateRolePermissions(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

rolesRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await roleController.createRole(req, res);
    } catch (error) {
      next(error);
    }
  },
);

rolesRouter.post(
  '/based/:roleId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await roleController.createRoleBased(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

rolesRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await roleController.getRoles(req, res);
    } catch (error) {
      next(error);
    }
  },
);

rolesRouter.get(
  '/:roleId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await roleController.getRoleDetails(req, res);
    } catch (error) {
      next(error);
    }
  },
);

rolesRouter.delete(
  '/:roleId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await roleController.deleteRole(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export { rolesRouter };
