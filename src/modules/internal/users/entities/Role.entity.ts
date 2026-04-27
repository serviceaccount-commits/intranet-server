import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  BeforeInsert,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';
import { Permission } from './Permission.entity';
import { User } from './User.entity';
import ES from '../../../../shared/types/enum/ES';

@Entity('roles')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  role_id!: string;

  @Column()
  role_name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: [ES.ACTIVE, ES.INACTIVE],
    default: ES.ACTIVE,
  })
  role_status!: string;

  @ManyToMany(() => Permission, { eager: false })
  @JoinTable({
    name: 'role_permissions', // The name of the join table
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'role_id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'permission_id',
    },
  })
  permissions!: Permission[];

  @ManyToOne(() => Role, (role) => role.baseRole)
  @JoinColumn({ name: 'base_role_id' })
  @Index()
  baseRole!: Role;

  @Column({ type: 'uuid', nullable: true })
  base_role_id!: string;

  @ManyToOne(() => Role, (role) => role.baseRole)
  @JoinColumn({ name: 'parent_role_id' })
  @Index()
  parentRole!: Role;

  @Column({ type: 'uuid', nullable: true })
  parent_role_id!: string;

  @Column({ default: false })
  is_base_role!: boolean;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];

  @BeforeInsert()
  addId() {
    this.role_id = uuidv4();
  }
}
