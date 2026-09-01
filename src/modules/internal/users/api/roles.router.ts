import { Router, Request, Response, NextFunction } from 'express';
import { RoleController } from '../controllers/roles.controller';
import { container } from '../../../../shared/config/inversify.config';
import { PermissionController } from '../controllers/permissions.controller';
import {
  checkAnyPermission,
  checkPermission,
} from '../../auth/middlewares/permission.middleware';

const roleController = container.get<RoleController>(RoleController);
const permissionController =
  container.get<PermissionController>(PermissionController);

const rolesRouter = Router();

// Anything that hands out abilities is behind `roles:manage`. Without it any
// authenticated user — a Viewer included — could call these by hand and grant
// themselves the whole catalog.
const canManageRoles = checkPermission('roles:manage');
const canReadRoles = checkPermission('roles:access');

// The plain role list is a lookup, not a management screen: Announcements and
// the Staff Directory both use it to fill their filters. Gating it on
// `roles:access` alone would break those pages, so any module that legitimately
// needs the names is accepted.
const canListRoles = checkAnyPermission(
  'roles:access',
  'announcements:access',
  'directory:access',
);

rolesRouter.get(
  '/:roleId/permissions',
  canReadRoles,
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
  canManageRoles,
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
  canManageRoles,
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
  canManageRoles,
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
  canManageRoles,
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
  canListRoles,
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
  canReadRoles,
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
  canManageRoles,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await roleController.deleteRole(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export { rolesRouter };
