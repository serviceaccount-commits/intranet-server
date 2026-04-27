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
  PrimaryGeneratedColumn,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';
import { Exam } from './Exam.entity';
import { QuestionType } from './QuestionType.entity';
import { Option } from './Option.entity';

@Entity('questions')
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  question_id!: string;

  @ManyToOne(() => Exam, (exam) => exam.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exam_id' })
  @Index()
  exam!: Exam;
  @Column()
  exam_id!: string;

  @ManyToOne(() => QuestionType)
  @JoinColumn({ name: 'question_type_id' })
  @Index()
  question_type!: QuestionType;
  @Column()
  question_type_id!: string;

  @OneToMany(() => Option, (option) => option.question)
  options?: Option[];

  @Column()
  question_text!: string;

  @CreateDateColumn()
  created_at!: Date;

  @BeforeInsert()
  addId() {
    this.question_id = uuidv4();
  }
}
