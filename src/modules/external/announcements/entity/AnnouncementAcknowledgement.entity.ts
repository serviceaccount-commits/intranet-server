import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  CreateDateColumn,
  Index,
  Column,
} from 'typeorm';
import { User } from '../../../internal/users/entities/User.entity';
import { Announcement } from './Announcement.entity';

@Entity('announcement_acknowledgements') // Correct table name
export class AnnouncementAcknowledgement extends BaseEntity {
  @PrimaryColumn('uuid')
  user_id!: string;

  @ManyToOne(() => User, (user) => user.acknowledgements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;

  @PrimaryColumn('uuid')
  announcement_id!: string;

  @ManyToOne(
    () => Announcement,
    (announcement) => announcement.acknowledgements,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'announcement_id' })
  @Index()
  announcement!: Announcement;

  @Column({ default: false })
  acknowledgement_in_time!: boolean;

  @CreateDateColumn()
  created_at!: Date; // Timestamp of acknowledgement
}
