import { logger } from '../../../../shared/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IUserService } from '../interfaces/users/user.service.interface';
import { CreateUserSchema } from '../schema/users/CreateUserSchema';
import { UpdateUserInput } from '../schema/users/UpdateUserSchema';
import { z, ZodError } from 'zod';
import { FilterUserSchema } from '../schema/users/FilterUserSchema';
import { BusinessValidationError } from '../../../../shared/errors/BusinessValidationError';


const SetUserRolesSchema = z
  .object({
    roleId: z.string().uuid(),
    additionalRoleIds: z.array(z.string().uuid()).max(50).default([]),
  })
  .strict();

/** Only these people give or take roles, the main one included. */
const ROLES_ASSIGN_PERMISSION = 'roles:assign';

/** Directory admins edit anyone, themselves included, without limits. */
const DIRECTORY_ADMIN_PERMISSION = 'directory:user:create';

/** What a person may change on their own record without being an admin. */
const SELF_EDITABLE_FIELDS = new Set([
  'firstName',
  'lastName',
  'workPhone',
  'personalEmail',
  'personalPhone',
  'residentialCountry',
  'countryNationality',
  'emergencyContactName',
  'emergencyContactPhone',
]);

/** `emergencyContactPhone` → `Emergency contact phone` */
const humanize = (field: string): string => {
  const words = field.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

@injectable()
export default class UserController {
  constructor(@inject(TYPES.IUserService) private userService: IUserService) {}

  async createUser(req: Request, res: Response) {
    const validationResult = CreateUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      const formattedErrors: Record<string, string> = {};

      const fieldErrors = validationResult.error.flatten().fieldErrors;

      for (const key in fieldErrors) {
        const typedKey = key as keyof typeof fieldErrors;
        const errorMessages = fieldErrors[typedKey];

        // This 'if' block is the key.
        // It checks that errorMessages is not undefined and not an empty array.
        if (errorMessages && errorMessages.length > 0) {
          if (errorMessages[0]) {
            formattedErrors[typedKey] = errorMessages[0];
          }
        }
      }

      return res.status(422).json({
        message: 'The given data was invalid.',
        errors: formattedErrors,
      });
    }

    try {
      const newUser = await this.userService.createUser(validationResult.data);
      res.json(newUser);
    } catch (error) {
      if (error instanceof BusinessValidationError) {
        return res.status(422).json({
          message: error.message,
          errors: error.errors,
        });
      }

      logger.error('Unexpected error in UserController:', error);
      return res
        .status(500)
        .json({ message: 'An internal server error ocurred.' });
    }
  }

  async updateLastActivity(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user id' });
      }

      await this.userService.updateUserLastActivity(userId);

      res.sendStatus(200);
    } catch (error) {
      logger.error('Unexpected error in UserController:', error);
      return res
        .status(500)
        .json({ message: 'An internal server error ocurred.' });
    }
  }

  async completeOnboarding(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user id' });
      }

      await this.userService.completeUserOnboarding(userId);

      res.sendStatus(200);
    } catch (error) {
      logger.error('Unexpected error in UserController:', error);
      return res
        .status(500)
        .json({ message: 'An internal server error ocurred.' });
    }
  }

  async getSheetData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { sheetOption } = req.params;

      if (sheetOption !== '1' && sheetOption !== '2') {
        res.sendStatus(400);
        return;
      }

      if (!userId) {
        res.sendStatus(400);
        return;
      }

      const sheetData = await this.userService.getSheetData(
        userId,
        +sheetOption as 1 | 2,
      );

      return res.json(sheetData);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error);
      }
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    const validationResult = FilterUserSchema.parse(req.query);

    try {
      const result = await this.userService.findUsers(validationResult);

      res.status(200).json({
        data: result,
        pagination: {
          totalItems: result.total,
          currentPage: validationResult.page,
          itemsPerPage: validationResult.limit,
          totalPages: Math.ceil(result.total / validationResult.limit),
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error);
      }
      next(error);
    }
  }

  async getUserById(req: Request, res: Response) {
    const { userid } = req.params;
    if (!userid) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    const user = await this.userService.getUserById(userid);

    res.json(user);
  }

  async getUserProfileById(req: Request, res: Response) {
    const { userId } = req.params;
    let withNoPhoneNumberCode = req.query['withNoPhoneNumberCode'] === 'true';

    if (withNoPhoneNumberCode === undefined) {
      withNoPhoneNumberCode = false;
    }

    if (!userId) {
      res.sendStatus(400);
      return;
    }
    const user = await this.userService.getUserProfileById(
      userId,
      withNoPhoneNumberCode,
    );

    res.json(user);
  }

  async getMyUserProfile(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      res.sendStatus(400);
      return;
    }
    const user = await this.userService.getUserProfileById(userId, false);

    res.json(user);
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) {

        return res.status(400).json({ error: 'Invalid user id' });
      }

      const input: UpdateUserInput = req.body ?? {};

      // The route lets anyone edit their own record. Who they are and what they
      // can reach (role, clients, team, status) stays with the directory admins.
      const actorId = req.user?.id;
      if (actorId === userId) {
        const permissions = await this.userService.getUserPermissions(actorId);
        if (!permissions.includes(DIRECTORY_ADMIN_PERMISSION)) {
          const locked = Object.keys(input).filter(
            (field) => !SELF_EDITABLE_FIELDS.has(field),
          );
          if (locked.length > 0) {
            return res.status(403).json({
              message: 'Only a directory admin can change your role, clients, team or status.',
              fields: locked,
            });
          }
        }
      }

      if (input.roleId !== undefined && actorId) {
        const actorPermissions = await this.userService.getUserPermissions(actorId);
        if (!actorPermissions.includes(ROLES_ASSIGN_PERMISSION)) {
          return res.status(403).json({ message: 'Only an admin can change roles.' });
        }
      }

      const updatedUser = await this.userService.updateUser(userId, input);

      res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof BusinessValidationError) {
        return res.status(422).json({
          message: error.message,
          errors: error.errors,
        });
      }

      if (error instanceof ZodError) {
        // Same shape as the business errors, so the editor can show the reason
        const errors: Record<string, string> = {};
        for (const issue of error.issues) {
          const field = String(issue.path[0] ?? 'form');
          if (!errors[field]) errors[field] = `${humanize(field)}: ${issue.message}`;
        }
        return res.status(422).json({
          message: Object.values(errors)[0] ?? 'Some fields are not valid.',
          errors,
        });
      }
      if (error instanceof Error) {

        return res.status(400).json({ message: error.message });
      }
    }
  }

  async getUserRoles(req: Request, res: Response) {
    try {
      res.json(await this.userService.getUserRoleIds(req.params['userId'] as string));
    } catch (error) {
      this.sendRolesError(res, error);
    }
  }

  async setUserRoles(req: Request, res: Response) {
    const parsed = SetUserRolesSchema.safeParse(req.body ?? {});
    if (!parsed.success || !req.user?.id) {
      return res.status(400).json({ message: 'Pick a main role; additional roles are optional.' });
    }
    try {
      await this.userService.setUserRoles(
        req.params['userId'] as string,
        parsed.data.roleId,
        parsed.data.additionalRoleIds,
        req.user.id,
      );
      res.sendStatus(204);
    } catch (error) {
      this.sendRolesError(res, error);
    }
  }

  async toggleAdditionalRole(req: Request, res: Response, enabled: boolean) {
    const { userId, roleId } = req.params;
    if (!userId || !roleId || !req.user?.id) return res.sendStatus(400);
    try {
      await this.userService.toggleAdditionalRole(userId, roleId, enabled, req.user.id);
      res.sendStatus(204);
    } catch (error) {
      this.sendRolesError(res, error);
    }
  }

  private sendRolesError(res: Response, error: unknown) {
    if (error instanceof BusinessValidationError) {
      return res.status(422).json({ message: error.message, errors: error.errors });
    }
    if (error instanceof Error) {
      const status = (error as { statusCode?: number }).statusCode ?? 400;
      return res.status(status).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Could not change the roles' });
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) {

        return res.status(400).json({ error: 'Invalid user id' });
      }

      const deletedUser = await this.userService.deleteUser(userId);

      res.status(200).json(deletedUser);
    } catch (error) {
      if (error instanceof BusinessValidationError) {
        return res.status(422).json({
          message: error.message,
          errors: error.errors,
        });
      }

      if (error instanceof ZodError) {

        return res.status(400).json(error);
      }
      if (error instanceof Error) {

        return res.status(400).json({ message: error.message });
      }
    }
  }
}
