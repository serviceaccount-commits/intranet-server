import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IUserReportsToService } from '../interfaces/userReportsTo/userReportsTo.service.interface';
import { TYPES } from '../../../../shared/config/containerTypes';

@injectable()
export class UserReportsToController {
  constructor(
    @inject(TYPES.IUserReportsToService)
    private userService: IUserReportsToService,
  ) {}

  async createReportsTo(req: Request, res: Response) {
    const { reporting_user_id, reports_to_user_id } = req.body;
    if (!reporting_user_id || !reports_to_user_id) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const reportsTo = await this.userService.createUserReportsTo(
      reporting_user_id,
      reports_to_user_id,
    );

    res.json(reportsTo);
  }

  async getReportsTo(_req: Request, res: Response) {
    const leaders = await this.userService.getLeaders();

    res.json(leaders);
  }
}
