import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IStaffDirectoryOrderService } from '../interfaces/staffDirectoryOrders/staffDirectoryOrder.service.interface';

@injectable()
export class StaffDirectoryOrderController {
  constructor(
    @inject(TYPES.IStaffDirectoryOrderService)
    private staffDirectoryService: IStaffDirectoryOrderService,
  ) {}

  async createStaffDirectoryOrder(req: Request, res: Response) {
    let { order, columnName, isCustom } = req.body;

    const newAssignment =
      await this.staffDirectoryService.createStaffDirectoryOrder(
        order,
        columnName,
        isCustom,
      );

    res.status(201).json(newAssignment);
  }

  async getStaffDirectoryOrder(_req: Request, res: Response) {
    res.json(await this.staffDirectoryService.getStaffDirectoryOrder());
  }

  async deleteStaffDirectoryOrderById(req: Request, res: Response) {
    const { staffDirectoryOrderId } = req.params;

    await this.staffDirectoryService.deleteStaffDirectoryOrderById(
      Number(staffDirectoryOrderId),
    );

    res.sendStatus(204);
  }
}
