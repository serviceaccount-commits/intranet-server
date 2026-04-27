import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';
import { Exam } from './Exam.entity';
import { User } from '../../../internal/users/entities/User.entity';
import ES from '../../../../shared/types/enum/ES';

@Entity('user_exam_attempts')
export class UserExamAttempt extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  attempt_id!: string;

  @ManyToOne(() => Exam)
  @JoinColumn({ name: 'exam_id' })
  @Index()
  exam!: Exam;
  @Column()
  exam_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;
  @Column()
  user_id!: string;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  attempt_date!: Date;

  @Column({ default: 0 })
  score!: number;

  @Column({
    type: 'enum',
    enum: [ES.PASSED, ES.FAILED],
  })
  status!: string;

  @Column({ default: true })
  isValid!: boolean;

  @BeforeInsert()
  addId() {
    this.attempt_id = uuidv4();
  }
}
