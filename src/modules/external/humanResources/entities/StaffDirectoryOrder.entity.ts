import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
} from 'typeorm';

@Entity('staff_directory_order')
export class StaffDirectoryOrder extends BaseEntity {
  @PrimaryGeneratedColumn()
  order_id!: number;

  @Column({ unique: true })
  @Index()
  order!: number;

  @Column({ unique: true })
  @Index()
  column_name!: string;

  is_custom!: boolean;
}
