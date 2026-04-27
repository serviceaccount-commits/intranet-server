import { StaffDirectoryOrder } from '../../entities/StaffDirectoryOrder.entity';

export interface IStaffDirectoryOrderService {
  createStaffDirectoryOrder(
    order: number,
    columnName: string,
    isCustom: boolean,
  ): Promise<StaffDirectoryOrder>;
  getStaffDirectoryOrder(): Promise<StaffDirectoryOrder[]>;
  deleteStaffDirectoryOrderById(staffDirectoryOrderId: number): Promise<void>;
}
