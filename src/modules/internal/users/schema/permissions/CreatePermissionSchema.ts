import { z } from 'zod';

export const CreatePermissionSchema = z.object({
  permission_name: z.string().min(2),
  app_module: z.string().min(2),
});

export type CreatePermissionInput = z.infer<typeof CreatePermissionSchema>;
