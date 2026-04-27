import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../internal/users/entities/User.entity';
import { v4 as uuidv4 } from 'uuid';
import ES from '../../../../shared/types/enum/ES';
import { Exam } from './Exam.entity';

@Entity('standalone_exams')
export class StandaloneExam extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  standalone_exam_id!: string;

  @Column()
  standalone_exam_name!: string;

  @Column({
    type: 'enum',
    enum: [ES.AWAITING_APPROVAL, ES.APPROVED, ES.IN_PROGRESS],
    default: ES.IN_PROGRESS,
  })
  standalone_exam_status!: string;

  @Column({ nullable: true })
  awaiting_approval_at!: Date;

  @Column({ nullable: true })
  approved_at!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;
  @Column({ nullable: true })
  user_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by_id' })
  @Index()
  approved_by!: User;
  @Column({ nullable: true })
  approved_by_id!: string;

  @OneToOne(() => Exam)
  @JoinColumn({ name: 'exam_id' })
  @Index()
  exam!: Exam;
  @Column({ nullable: true })
  exam_id!: string;

  @BeforeInsert()
  addId() {
    this.standalone_exam_id = uuidv4();
  }
}
