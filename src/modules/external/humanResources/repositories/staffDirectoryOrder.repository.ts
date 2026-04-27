import { injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { IStaffDirectoryOrderRepository } from '../interfaces/staffDirectoryOrders/staffDirectoryOrder.repository.interface';
import { StaffDirectoryOrder } from '../entities/StaffDirectoryOrder.entity';

@injectable()
export class StaffDirectoryOrderRepository
  implements IStaffDirectoryOrderRepository
{
  async create(
    staffDirectoryOrder: StaffDirectoryOrder,
  ): Promise<StaffDirectoryOrder> {
    return await AppDataSource.manager.save(staffDirectoryOrder);
  }

  async findAll(): Promise<StaffDirectoryOrder[]> {
    return await AppDataSource.manager.find(StaffDirectoryOrder);
  }

  async findById(id: number): Promise<StaffDirectoryOrder | null> {
    return await AppDataSource.manager.findOne(StaffDirectoryOrder, {
      where: {
        order_id: id,
      },
    });
  }

  async findByName(name: string): Promise<StaffDirectoryOrder | null> {
    return await AppDataSource.manager.findOne(StaffDirectoryOrder, {
      where: {
        column_name: name,
      },
    });
  }

  async deleteById(staffDirectoryOrderId: number): Promise<void> {
    const staffDirectoryOrder = await this.findById(staffDirectoryOrderId);
    if (!staffDirectoryOrder) {
      throw new Error(
        `Staff Directory Order with id ${staffDirectoryOrderId} not found`,
      );
    }
    await AppDataSource.manager.remove(staffDirectoryOrder);
  }
}
