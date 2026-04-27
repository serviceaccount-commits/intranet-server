import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Class } from './Class.entity';
import { v4 as uuidv4 } from 'uuid';
import { Question } from './Question.entity';
import ES from '../../../../shared/types/enum/ES';
import { StandaloneExam } from './StandaloneExam.entity';

@Entity('exams')
export class Exam extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  exam_id!: string;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  @Index()
  class!: Class;
  @Column({ nullable: true })
  class_id!: string;

  @OneToOne(() => StandaloneExam)
  @JoinColumn({ name: 'standalone_exam_id' })
  @Index()
  standalone_exam?: StandaloneExam;
  @Column({ nullable: true })
  standalone_exam_id?: string;

  @OneToMany(() => Question, (question) => question.exam)
  questions?: Question[];

  @Column({
    type: 'enum',
    enum: [ES.CLASS_EXAM, ES.STANDALONE_EXAM],
    default: ES.CLASS_EXAM,
  })
  exam_type!: string;

  @Column()
  exam_title!: string;

  @Column()
  passing_score!: number;

  @Column()
  version!: number;

  @Column({
    type: 'enum',
    enum: [ES.PUBLISHED, ES.DRAFT, ES.OUTDATED],
    default: ES.DRAFT,
  })
  exam_status!: string;

  @Column()
  max_attempts!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @BeforeInsert()
  addId() {
    this.exam_id = uuidv4();
  }
}
