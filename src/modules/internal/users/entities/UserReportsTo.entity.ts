import {
  Entity,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  PrimaryColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity('user_reports_to')
export class UserReportsTo extends BaseEntity {
  @PrimaryColumn('uuid')
  reporting_user_id!: string;

  @ManyToOne(() => User, (user) => user.reportingTo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporting_user_id' })
  reportingUser!: User; // The user who reports to someone

  @PrimaryColumn('uuid')
  reports_to_user_id!: string;

  @ManyToOne(() => User, (user) => user.reportsTo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reports_to_user_id' })
  reportsToUser!: User; // The user *being reported to* (the manager/supervisor)
}
