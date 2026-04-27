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
import { TrainingTopic } from './TrainingTopic.entity';
import { User } from '../../../internal/users/entities/User.entity';

import { v4 as uuidv4 } from 'uuid';
import ES from '../../../../shared/types/enum/ES';
import { CourseUserValue } from './CourseUserValue.entity';

@Entity('courses')
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  course_id!: string;

  @Column()
  course_name!: string;

  @Column()
  course_description!: string;

  @Column({
    type: 'enum',
    enum: [ES.ACTIVE, ES.INACTIVE, ES.PUBLISHED, ES.DRAFT, ES.ARCHIVED],
    default: ES.ACTIVE,
  })
  course_status!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;
  @Column({ nullable: true })
  user_id!: string;

  @OneToMany(() => TrainingTopic, (topic) => topic.course)
  topics!: TrainingTopic[];

  @OneToMany(() => CourseUserValue, (courseValue) => courseValue.course)
  userValues?: CourseUserValue[];

  @BeforeInsert()
  addId() {
    this.course_id = uuidv4();
  }
}
