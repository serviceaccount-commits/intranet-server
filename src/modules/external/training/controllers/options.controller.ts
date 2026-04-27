import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../../../shared/errors/AppError';
import { IOptionService } from '../interfaces/options/option.service.repository';
import { CreateOptionInput } from '../schema/options/CreateOptionSchema';
import { UpdateOptionInput } from '../schema/options/UpdateOptionSchema';

@injectable()
export class OptionController {
  constructor(
    @inject(TYPES.IOptionService) private optionService: IOptionService,
  ) {}

  async createOption(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateOptionInput = req.body;

      const exam = await this.optionService.createOption(input);

      res.status(201).json(exam);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error });
      }
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async updateOption(req: Request, res: Response, next: NextFunction) {
    try {
      const input: UpdateOptionInput = req.body;
      const { optionId } = req.params;

      if (!optionId) {
        res.status(400);
        return;
      }

      const exam = await this.optionService.updateOption(optionId, input);

      res.status(200).json(exam);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error });
      }
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async deleteOption(req: Request, res: Response, next: NextFunction) {
    try {
      const { optionId } = req.params;

      if (!optionId) {
        res.status(400);
        return;
      }

      await this.optionService.deleteOption(optionId);

      res.status(200).json({ message: 'Option deleted successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(400).json({ message: error.message });
      } else {
        next(error);
      }
    }
  }
}
