import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  Column,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';
import { User } from '../../../internal/users/entities/User.entity';
import { Document } from '../../../internal/documents/entities/Document.entity';
import ES from '../../../../shared/types/enum/ES';
import { AnnouncementAcknowledgement } from './AnnouncementAcknowledgement.entity';
import { AnnouncementAssignedToUser } from './AnnouncementUsers.entity';
import { AnnouncementRead } from './AnnouncementRead.entity';

@Entity('announcements')
export class Announcement extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  announcement_id!: string;

  @Column({
    type: 'enum',
    enum: [ES.HIGH, ES.MEDIUM, ES.LOW],
    default: ES.LOW,
  })
  priority_level!: string;

  @Column({
    type: 'enum',
    enum: [ES.REGULAR, ES.PERSISTENT],
    default: ES.REGULAR,
  })
  type!: string;

  @Column({
    type: 'enum',
    enum: [ES.OPENED, ES.CLOSED],
    default: ES.OPENED,
  })
  announcement_state!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({
    type: 'varchar',
    length: 255,
    default: 'Default Title',
    nullable: false,
  })
  title!: string;

  @Column({ default: '' })
  preview!: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  open_acknowledge_until!: Date;

  @ManyToOne(() => User, (user) => user.announcements)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user!: User;
  @Column()
  user_id!: string;

  @OneToOne(() => Document)
  @JoinColumn({ name: 'document_id' })
  @Index()
  document!: Document;
  @Column({ nullable: true })
  document_id!: string;

  @OneToMany(() => AnnouncementAcknowledgement, (ack) => ack.announcement)
  acknowledgements?: AnnouncementAcknowledgement[];

  @OneToMany(() => AnnouncementRead, (ack) => ack.announcement)
  read?: AnnouncementRead[];

  @OneToMany(() => AnnouncementAssignedToUser, (assign) => assign.announcement)
  assigned_to_users?: AnnouncementAssignedToUser[];

  @Column({ default: true })
  announcement_edit_available!: boolean;

  @BeforeInsert()
  addId() {
    this.announcement_id = uuidv4();
  }
}
