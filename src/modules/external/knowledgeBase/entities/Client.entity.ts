import {
  Entity,
  BaseEntity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  Index,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

import { User } from '../../../internal/users/entities/User.entity';
import { Topic } from './Topic.entity';
import REGION from '../../../../shared/types/enum/REGION';
import ES from '../../../../shared/types/enum/ES';

@Entity('clients')
export class Client extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  client_id!: string;

  @Column({ unique: true, nullable: true })
  client_shared_id!: string;

  @Column({
    type: 'enum',
    enum: [REGION.US, REGION.CO],
    default: 'us',
  })
  region!: string;

  @Column({ unique: true })
  client_name!: string;

  @Column({ default: true })
  client_edit_available!: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;
  @Column({ nullable: true })
  user_id!: string;

  @OneToMany(() => Topic, (topic) => topic.client)
  topics!: Topic[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToMany(() => User, (user) => user.clients)
  users!: User[];

  @Column({ default: false })
  is_im: boolean = false;

  @Column({ default: false })
  is_flx: boolean = false;

  @Column({
    type: 'enum',
    enum: [ES.PARICUS_LLC, ES.PARICUS_COLOMBIA],
    default: ES.PARICUS_LLC,
  })
  entity!: string;

  @Column({ nullable: true, unique: true })
  address!: string;

  @Column({ nullable: true })
  primary_contact_name!: string;

  @Column({ nullable: true, unique: true })
  primary_contact_email!: string;

  @Column({ nullable: true, unique: true })
  primary_contact_phone!: string;

  @BeforeInsert()
  addId() {
    this.client_id = uuidv4();
  }
}
