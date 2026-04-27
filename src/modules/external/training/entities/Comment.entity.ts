import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { Class } from './Class.entity';
import { User } from '../../../internal/users/entities/User.entity';
import ES from '../../../../shared/types/enum/ES';

import { v4 as uuidv4 } from 'uuid';

@Entity('comments')
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  comment_id!: string;

  @Column()
  comment_content!: string;

  @Column({
    type: 'enum',
    enum: [ES.ACTIVE, ES.INACTIVE],
    default: ES.ACTIVE,
  })
  comment_status!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;
  @Column({ nullable: true })
  user_id!: string;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  @Index()
  class!: Class;
  @Column({ nullable: true })
  class_id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  addId() {
    this.comment_id = uuidv4();
  }
}
