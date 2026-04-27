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
import { User } from '../../../internal/users/entities/User.entity';
import { Course } from './Course.entity';
import { TrainingTopicUserValue } from './TrainingTopicUserValue.entity';
import ES from '../../../../shared/types/enum/ES';

import { v4 as uuidv4 } from 'uuid';

@Entity('course_user_values')
export class CourseUserValue extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  course_value_id!: string;

  @Column({
    type: 'enum',
    enum: [ES.ACTIVE, ES.INACTIVE],
    default: ES.ACTIVE,
  })
  user_availability_status!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;
  @Column({ nullable: true })
  user_id!: string;

  @ManyToOne(() => Course, (course) => course.userValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  @Index()
  course!: Course;
  @Column({ nullable: true })
  course_id!: string;

  @OneToMany(
    () => TrainingTopicUserValue,
    (topicValue) => topicValue.courseValue,
  )
  topicValues!: TrainingTopicUserValue[];

  @BeforeInsert()
  addId() {
    this.course_id = uuidv4();
  }
}
