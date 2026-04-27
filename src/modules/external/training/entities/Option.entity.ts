import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';
import { Question } from './Question.entity';
import ES from '../../../../shared/types/enum/ES';

@Entity('options')
export class Option extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  option_id!: string;

  @ManyToOne(() => Question, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  @Index()
  question!: Question;
  @Column()
  question_id!: string;

  @Column()
  option_text!: string;

  @Column({ default: false })
  is_correct!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @Column({
    type: 'enum',
    enum: [ES.ACTIVE, ES.INACTIVE],
    default: ES.ACTIVE,
  })
  status!: string;

  @BeforeInsert()
  addId() {
    this.option_id = uuidv4();
  }
}
