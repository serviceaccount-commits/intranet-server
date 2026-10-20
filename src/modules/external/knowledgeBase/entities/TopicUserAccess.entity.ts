import { Entity, CreateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';

import { User } from '../../../internal/users/entities/User.entity';
import { Topic } from './Topic.entity';

/**
 * Staff allowed to see a restricted KB folder. A folder with no rows here is
 * unrestricted (visible to whoever has access to its client).
 */
@Entity('topic_user_access')
export class TopicUserAccess {
  @PrimaryColumn('uuid')
  topic_id!: string;

  @PrimaryColumn('uuid')
  user_id!: string;

  @ManyToOne(() => Topic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic!: Topic;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
