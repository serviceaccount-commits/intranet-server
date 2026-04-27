import { StaffDirectoryOrder } from '../../entities/StaffDirectoryOrder.entity';

export interface IStaffDirectoryOrderRepository {
  create(
    staffDirectoryOrder: StaffDirectoryOrder,
  ): Promise<StaffDirectoryOrder>;
  findAll(): Promise<StaffDirectoryOrder[]>;
  findById(id: number): Promise<StaffDirectoryOrder | null>;
  findByName(name: string): Promise<StaffDirectoryOrder | null>;
  deleteById(staffDirectoryOrderId: number): Promise<void>;
}
