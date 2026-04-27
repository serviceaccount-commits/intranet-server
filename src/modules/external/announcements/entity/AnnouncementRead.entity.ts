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

@Entity('announcement_read') // Correct table name
export class AnnouncementRead extends BaseEntity {
  @PrimaryColumn('uuid')
  user_id!: string;

  @ManyToOne(() => User, (user) => user.read, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;

  @PrimaryColumn('uuid')
  announcement_id!: string;

  @ManyToOne(() => Announcement, (announcement) => announcement.read, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'announcement_id' })
  @Index()
  announcement!: Announcement;

  @CreateDateColumn()
  created_at!: Date; // Timestamp of read
}
