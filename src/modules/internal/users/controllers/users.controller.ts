import { logger } from '../../../../shared/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IUserService } from '../interfaces/users/user.service.interface';
import { CreateUserSchema } from '../schema/users/CreateUserSchema';
import { UpdateUserInput } from '../schema/users/UpdateUserSchema';
import { ZodError } from 'zod';
import { FilterUserSchema } from '../schema/users/FilterUserSchema';
import { BusinessValidationError } from '../../../../shared/errors/BusinessValidationError';


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

      const input: UpdateUserInput = req.body;

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

        return res.status(400).json(error);
      }
      if (error instanceof Error) {

        return res.status(400).json({ message: error.message });
      }
    }
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
