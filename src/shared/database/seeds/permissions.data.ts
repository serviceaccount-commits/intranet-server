import { Permission } from '../../../modules/internal/users/entities/Permission.entity';

export const PERMISSIONS: Partial<Permission>[] = [
  { permission_id: 'dummy:confidential:one', app_module: 'knowledge-base' },
  { permission_id: 'kb:access', app_module: 'knowledge-base' },
  { permission_id: 'kb:client:manage', app_module: 'knowledge-base' },
  { permission_id: 'kb:topic:manage', app_module: 'knowledge-base' },
  { permission_id: 'kb:article:manage', app_module: 'knowledge-base' },
  { permission_id: 'kb:article:view:metadata', app_module: 'knowledge-base' },
  { permission_id: 'kb:article:move', app_module: 'knowledge-base' },

  { permission_id: 'directory:access', app_module: 'staff-directory' },
  { permission_id: 'directory:list', app_module: 'staff-directory' },
  { permission_id: 'directory:profile:access', app_module: 'staff-directory' },
  { permission_id: 'directory:user:create', app_module: 'staff-directory' },
  { permission_id: 'directory:user:export', app_module: 'staff-directory' },

  { permission_id: 'announcements:access', app_module: 'announcements' },
  { permission_id: 'announcements:manage', app_module: 'announcements' },

  { permission_id: 'training:access', app_module: 'training' },
  { permission_id: 'training:view:admin', app_module: 'training' },
  { permission_id: 'training:course:manage', app_module: 'training' },
  { permission_id: 'training:course:assign', app_module: 'training' },
  { permission_id: 'training:topic:manage', app_module: 'training' },
  { permission_id: 'training:class:exam:manage', app_module: 'training' },
  { permission_id: 'training:standalone:exam:manage', app_module: 'training' },
  { permission_id: 'training:standalone:exam:approve', app_module: 'training' },
  { permission_id: 'training:exam:manage:attempts', app_module: 'training' },

  { permission_id: 'roles:access', app_module: 'admin' },
  { permission_id: 'roles:manage', app_module: 'admin' },

  { permission_id: 'login', app_module: 'admin' },
];
