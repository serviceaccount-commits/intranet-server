import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrainingTopic } from './TrainingTopic.entity';
import { User } from '../../../internal/users/entities/User.entity';
import { Comment } from './Comment.entity';

import { v4 as uuidv4 } from 'uuid';
import ES from '../../../../shared/types/enum/ES';
import { Document } from '../../../internal/documents/entities/Document.entity';
import { Exam } from './Exam.entity';

@Entity('classes')
export class Class extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  class_id!: string;

  @Column()
  class_name!: string;

  @Column()
  class_description!: string;

  @Column()
  private_comments!: boolean;

  @Column({
    type: 'enum',
    enum: [ES.PUBLISHED, ES.DRAFT, ES.ARCHIVED],
    default: ES.DRAFT,
  })
  class_status!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;
  @Column({ nullable: true })
  user_id!: string;

  @ManyToOne(() => TrainingTopic)
  @JoinColumn({ name: 'topic_id' })
  @Index()
  topic!: TrainingTopic;
  @Column({ nullable: true })
  topic_id!: string;

  @OneToMany(() => Comment, (commentEntity) => commentEntity.class)
  comments!: Comment[];

  @OneToOne(() => Document)
  @JoinColumn({ name: 'document_id' })
  @Index()
  document!: Document;
  @Column({ nullable: true })
  document_id!: string;

  @OneToMany(() => Exam, (exam) => exam.class)
  exams!: Exam[];

  @BeforeInsert()
  addId() {
    this.class_id = uuidv4();
  }
}
