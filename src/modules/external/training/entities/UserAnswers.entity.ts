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
  UpdateDateColumn,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';
import { UserExamAttempt } from './UserExamAttempts.entity';
import { Question } from './Question.entity';
import { Option } from './Option.entity';

@Entity('user_answers')
export class UserAnswer extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  user_answer_id!: string;

  @ManyToOne(() => UserExamAttempt)
  @JoinColumn({ name: 'attempt_id' })
  @Index()
  attempt!: UserExamAttempt;
  @Column()
  attempt_id!: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  @Index()
  question!: Question;
  @Column()
  question_id!: string;

  @ManyToOne(() => Option)
  @JoinColumn({ name: 'option_id' })
  @Index()
  option!: Option;
  @Column()
  option_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @BeforeInsert()
  addId() {
    this.user_answer_id = uuidv4();
  }
}
