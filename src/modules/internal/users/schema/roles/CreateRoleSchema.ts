import { z } from 'zod';

export const CreateRoleSchema = z
  .object({
    roleName: z.string().min(1),
    roleDescription: z.string().min(1),
    roleId: z.string().min(1),
  })
  .strict();

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
