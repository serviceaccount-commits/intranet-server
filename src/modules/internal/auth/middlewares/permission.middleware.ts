import { Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { UserService } from '../../users/services/user.service';
import { TYPES } from '../../../../shared/config/containerTypes';

const userService = container.get<UserService>(TYPES.IUserService);

export const checkPermission = async (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userPermissions = await userService.getUserPermissions(userId);

    if (userPermissions.includes(requiredPermission)) {
      next();
    } else {
      res
        .status(403)
        .json({
          message: 'Forbidden: You do not have the required permission.',
        });
    }
  };
};
