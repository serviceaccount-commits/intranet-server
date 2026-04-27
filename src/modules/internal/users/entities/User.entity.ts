import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
  Index,
  BaseEntity,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

import ES from '../../../../shared/types/enum/ES';
import { Client } from '../../../external/knowledgeBase/entities/Client.entity';
import { Role } from './Role.entity';
import { Assignment } from './Assignment.entity';
import { UserReportsTo } from './UserReportsTo.entity';
import { Announcement } from '../../../external/announcements/entity/Announcement.entity';
import { AnnouncementAcknowledgement } from '../../../external/announcements/entity/AnnouncementAcknowledgement.entity';
import { UserCustomFieldValue } from './UserCustomFieldValue.entity';
import { AnnouncementAssignedToUser } from '../../../external/announcements/entity/AnnouncementUsers.entity';
import { AnnouncementRead } from '../../../external/announcements/entity/AnnouncementRead.entity';
import { UserDetails } from './UserDetail.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  user_id!: string;

  // TODO: change to just having full_name so that the search is better, but I have to delete all users and data for this change to be properly done
  @Column()
  @Index()
  first_name!: string;

  @Column()
  @Index()
  last_name!: string;

  @Column({ unique: true })
  @Index()
  work_email!: string;

  @Column({ unique: true })
  work_phone!: string;

  @Column({ default: false })
  @Index()
  selectable_as_leader!: boolean;

  @Column()
  job_title!: string;

  @OneToOne(() => UserReportsTo, (UserReportsTo) => UserReportsTo.reportingUser)
  reportingTo?: UserReportsTo;

  @OneToOne(() => UserDetails, 'user')
  @JoinColumn({ name: 'user_details_id' })
  @Index()
  userDetails!: UserDetails;

  @Column()
  user_details_id!: number;

  @Column({
    type: 'enum',
    enum: [ES.ACTIVE, ES.INACTIVE],
    default: ES.ACTIVE,
  })
  status!: string;

  @Column({ default: true })
  user_edit_available!: boolean;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  @Index()
  role!: Role;

  @Column({ type: 'uuid', nullable: true })
  role_id!: string;

  @ManyToMany(() => Client, (client) => client.users)
  @JoinTable({
    name: 'user_clients', // The name of the join table
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'user_id',
    },
    inverseJoinColumn: {
      name: 'client_id',
      referencedColumnName: 'client_id',
    },
  })
  clients?: Client[];

  @ManyToMany(() => Assignment, (assignment) => assignment.users)
  @JoinTable({
    name: 'user_assignments', // The name of the join table
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'user_id',
    },
    inverseJoinColumn: {
      name: 'assignment_id',
      referencedColumnName: 'assignment_id',
    },
  })
  assignments?: Assignment[];

  @OneToMany(() => Announcement, (announcement) => announcement.user)
  announcements?: Announcement[];

  @OneToMany(
    () => AnnouncementAssignedToUser,
    (AnnouncementAssignedToUser) => AnnouncementAssignedToUser.user,
  )
  assignedAnnouncements?: AnnouncementAssignedToUser[];

  @OneToMany(() => AnnouncementAcknowledgement, (ack) => ack.user)
  acknowledgements?: AnnouncementAcknowledgement[];

  @OneToMany(() => AnnouncementRead, (ack) => ack.user)
  read?: AnnouncementRead[];

  @OneToMany(
    () => UserReportsTo,
    (userReportsTo) => userReportsTo.reportsToUser,
  )
  reportsTo?: UserReportsTo[]; // Users who report *to* this user

  @OneToMany(
    () => UserCustomFieldValue,
    (customFieldValue) => customFieldValue.user,
  )
  customFieldValues?: UserCustomFieldValue[];

  @Column({ default: false })
  email_verified!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_activity_at?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  addId() {
    this.user_id = uuidv4();
  }
}
