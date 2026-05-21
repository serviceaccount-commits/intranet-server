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
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

import { User } from '../../../internal/users/entities/User.entity';
import { Client } from './Client.entity';

@Entity('topics')
export class Topic extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  topic_id!: string;

  @Column()
  topic_name!: string;

  @Column({ default: true })
  topic_edit_available!: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
  @Column({ nullable: true })
  user_id!: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client!: Client;
  @Column({ nullable: true })
  client_id!: string;

  // Self-referencing FK: when present, this topic is a sub-folder of another
  // topic under the same client. NULL = root folder of the client.
  @ManyToOne(() => Topic, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_topic_id' })
  parent?: Topic | null;
  @Column({ type: 'uuid', nullable: true })
  parent_topic_id!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  addId() {
    this.topic_id = uuidv4();
  }
}
