import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './Course.entity';
import { Class } from './Class.entity';

import { v4 as uuidv4 } from 'uuid';
import ES from '../../../../shared/types/enum/ES';

@Entity('training_topics')
export class TrainingTopic extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  topic_id!: string;

  @Column()
  topic_name!: string;

  @Column({
    type: 'enum',
    enum: [ES.ACTIVE, ES.INACTIVE, ES.PUBLISHED, ES.DRAFT, ES.ARCHIVED],
    default: ES.ACTIVE,
  })
  topic_status!: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  @Index()
  course!: Course;

  @Column({ nullable: true })
  course_id!: string;

  @OneToMany(() => Class, (classEntity) => classEntity.topic)
  classes!: Class[];

  @BeforeInsert()
  addId() {
    this.topic_id = uuidv4();
  }
}
