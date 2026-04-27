import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../../internal/users/entities/User.entity';
import { Announcement } from './Announcement.entity';

@Entity('announcement_assigned_to_users') // Correct table name
export class AnnouncementAssignedToUser extends BaseEntity {
  @PrimaryColumn('uuid')
  user_id!: string;

  @ManyToOne(() => User, (user) => user.assignedAnnouncements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;

  @PrimaryColumn('uuid')
  announcement_id!: string;

  @ManyToOne(
    () => Announcement,
    (announcement) => announcement.assigned_to_users,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'announcement_id' })
  @Index()
  announcement!: Announcement;

  @CreateDateColumn()
  created_at!: Date;
}
