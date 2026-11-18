import { z } from 'zod';

/**
 * The whole "Manage access" screen of one client, saved at once: who is on the
 * client, and the list of every folder shown. `allowed: null` (or an empty
 * list) leaves the folder open to everyone on the client.
 */
export const ClientAccessSchema = z
  .object({
    members: z.array(z.string().uuid()).max(2000),
    folders: z
      .array(
        z
          .object({
            topic_id: z.string().uuid(),
            allowed: z.array(z.string().uuid()).max(2000).nullable(),
          })
          .strict(),
      )
      .max(1000),
  })
  .strict();

export type ClientAccessInput = z.infer<typeof ClientAccessSchema>;
