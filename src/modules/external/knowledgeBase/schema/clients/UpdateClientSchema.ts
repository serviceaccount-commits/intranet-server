import { z } from 'zod';

export const UpdateClientSchema = z
  .object({
    clientName: z.string().min(1),
    clientId: z.string().min(1),
  })
  .strict();

export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
