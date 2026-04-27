import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  BeforeInsert,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { User } from './User.entity';

@Entity('assignments')
export class Assignment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  assignment_id!: string;

  @Column()
  @Index()
  assignment_name!: string;

  @ManyToMany(() => User, (user) => user.assignments)
  users!: User[];

  @BeforeInsert()
  addId() {
    this.assignment_id = uuidv4();
  }
}
