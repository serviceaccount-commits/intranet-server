import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Class } from './Class.entity';
import { User } from '../../../internal/users/entities/User.entity';
import { TrainingTopicUserValue } from './TrainingTopicUserValue.entity';
import ES from '../../../../shared/types/enum/ES';

@Entity('class_user_values')
export class ClassUserValue extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  class_value_id!: string;

  @Column({
    type: 'enum',
    enum: [ES.COMPLETED, ES.INCOMPLETE],
    default: ES.INCOMPLETE,
  })
  completion_status!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;
  @Column({ nullable: true })
  user_id!: string;

  @ManyToOne(() => TrainingTopicUserValue)
  @JoinColumn({ name: 'topic_value_id' })
  @Index()
  topicValue!: TrainingTopicUserValue;
  @Column({ nullable: true })
  topic_value_id!: string;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  @Index()
  class!: Class;
  @Column({ nullable: true })
  class_id!: string;
}
