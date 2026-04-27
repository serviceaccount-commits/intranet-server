import { inject, injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { TYPES } from '../../../../shared/config/containerTypes';

import { IStaffDirectoryOrderService } from '../interfaces/staffDirectoryOrders/staffDirectoryOrder.service.interface';
import { IStaffDirectoryOrderRepository } from '../interfaces/staffDirectoryOrders/staffDirectoryOrder.repository.interface';
import { StaffDirectoryOrder } from '../entities/StaffDirectoryOrder.entity';

@injectable()
export class StaffDirectoryOrderService implements IStaffDirectoryOrderService {
  constructor(
    @inject(TYPES.IStaffDirectoryOrderRepository)
    private staffDirectoryOrderRepository: IStaffDirectoryOrderRepository,
  ) {}

  async createStaffDirectoryOrder(
    order: number,
    columnName: string,
    isCustom: boolean,
  ): Promise<StaffDirectoryOrder> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const existingStaffOrder =
        await this.staffDirectoryOrderRepository.findByName(columnName);

      if (existingStaffOrder) {
        throw new Error(
          `Staff Directory Order with name ${columnName} already exists.`,
        );
      }

      const newStaffDirectoryOrder = new StaffDirectoryOrder();
      newStaffDirectoryOrder.order = order;
      newStaffDirectoryOrder.column_name = columnName;
      newStaffDirectoryOrder.is_custom = isCustom;

      return await this.staffDirectoryOrderRepository.create(
        newStaffDirectoryOrder,
      );
    });
  }

  async getStaffDirectoryOrder(): Promise<StaffDirectoryOrder[]> {
    return await this.staffDirectoryOrderRepository.findAll();
  }

  async deleteStaffDirectoryOrderById(
    staffDirectoryOrderId: number,
  ): Promise<void> {
    await this.staffDirectoryOrderRepository.deleteById(staffDirectoryOrderId);
  }
}
