import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  BeforeInsert,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

@Entity('documents')
export class Document extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  document_id!: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 255,
    default: 'article-document',
  })
  file_name!: string;

  @Column({
    type: 'enum',
    enum: ['img', 'txt', 'png', 'unknown'],
    default: 'unknown',
  })
  file_type!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @BeforeInsert()
  addId() {
    this.document_id = uuidv4();
  }
}
