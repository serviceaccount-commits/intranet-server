import {
  BaseEntity,
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
import { CourseUserValue } from './CourseUserValue.entity';
import { ClassUserValue } from './ClassUserValue.entity';

@Entity('training_topic_user_values')
export class TrainingTopicUserValue extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  topic_value_id!: string;

  @Column()
  @Index()
  completed_classes_count!: number;

  @Column()
  @Index()
  total_classes_count!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;
  @Column({ nullable: true })
  user_id!: string;

  @ManyToOne(() => CourseUserValue)
  @JoinColumn({ name: 'course_value_id' })
  @Index()
  courseValue!: CourseUserValue;
  @Column({ nullable: true })
  course_value_id!: string;

  @ManyToOne(() => TrainingTopic)
  @JoinColumn({ name: 'topic_id' })
  @Index()
  topic!: TrainingTopic;

  @Column({ nullable: true })
  topic_id!: string;

  @OneToMany(() => ClassUserValue, (classValue) => classValue.topicValue)
  classValues!: ClassUserValue[];
}
