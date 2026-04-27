import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  Column,
  PrimaryColumn,
  Index,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';
import { User } from './User.entity';
import { CustomField } from './CustomField.entity';

@Entity('user_custom_field_values')
@Index('idx_user_field', ['user_id', 'field_id'])
export class UserCustomFieldValue extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  value_id!: string;

  @Column({ nullable: true })
  value?: string;

  @PrimaryColumn('uuid')
  user_id!: string;

  @ManyToOne(() => User, (user) => user.customFieldValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @PrimaryColumn('uuid')
  field_id!: string;

  @ManyToOne(() => CustomField, (customField) => customField.userValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'field_id' })
  field!: CustomField;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @BeforeInsert()
  addId() {
    this.value_id = uuidv4();
  }
}
