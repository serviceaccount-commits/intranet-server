import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity('user_details')
export class UserDetails extends BaseEntity {
  @PrimaryGeneratedColumn()
  user_details_id!: number;

  @Column({ unique: true })
  personal_email!: string;

  @Column({ unique: true })
  personal_phone!: string;

  @Column()
  residential_country!: string;

  @Column()
  country_nationality!: string;

  @Column()
  emergency_contact_name!: string;

  @Column({ unique: true })
  emergency_contact_phone!: string;

  @Column({ nullable: true })
  re_hirable?: boolean;

  @Column('timestamptz')
  hire_date!: Date;

  @OneToOne(() => User, 'userDetails')
  user!: User;
}
