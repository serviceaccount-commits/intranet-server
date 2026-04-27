import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  BeforeInsert,
  Column,
  OneToMany,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';
import ES from '../../../../shared/types/enum/ES';
import { UserCustomFieldValue } from './UserCustomFieldValue.entity';

@Entity('custom_fields')
export class CustomField extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  field_id!: string;

  @Column({ unique: true })
  field_name!: string;

  @Column({
    type: 'enum',
    enum: [ES.STRING, ES.BOOLEAN, ES.DATE],
    default: ES.STRING,
  })
  data_type!: string;

  @Column({
    type: 'enum',
    enum: [ES.PUBLIC, ES.PRIVATE],
    default: ES.PRIVATE,
  })
  visibility!: string;

  @Column({
    type: 'enum',
    enum: [ES.ACTIVE, ES.INACTIVE],
    default: ES.INACTIVE,
  })
  status!: string;

  @OneToMany(
    () => UserCustomFieldValue,
    (customFieldValue) => customFieldValue.field,
  )
  userValues!: UserCustomFieldValue[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @BeforeInsert()
  addId() {
    this.field_id = uuidv4();
  }
}
