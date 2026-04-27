import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm';

@Entity('permissions')
export class Permission extends BaseEntity {
  @PrimaryColumn()
  permission_id!: string;

  @Column({
    type: 'enum',
    enum: [
      'knowledge-base',
      'staff-directory',
      'announcements',
      'training',
      'profile',
      'admin',
    ],
    default: 'knowledge-base',
  })
  app_module!: string;
}
