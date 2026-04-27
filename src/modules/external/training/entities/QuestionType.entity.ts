import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';
import ES from '../../../../shared/types/enum/ES';

@Entity('question_types')
export class QuestionType extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  question_type_id!: string;

  @Column({
    type: 'enum',
    enum: [ES.MULTIPLE_SELECTION, ES.TRUE_FALSE],
    default: ES.MULTIPLE_SELECTION,
    unique: true,
  })
  type_name!: string;

  @BeforeInsert()
  addId() {
    this.question_type_id = uuidv4();
  }
}
