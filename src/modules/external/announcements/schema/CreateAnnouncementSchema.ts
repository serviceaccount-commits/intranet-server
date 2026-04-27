import { z } from 'zod';
import ES from '../../../../shared/types/enum/ES';

export const CreateAnnouncementSchema = z
  .object({
    // User fields
    priorityLevel: z.enum([ES.HIGH, ES.MEDIUM, ES.LOW]),
    type: z.enum([ES.REGULAR, ES.PERSISTENT]),
    title: z.string().min(1),
    preview: z.string().optional(),
    userIds: z.array(z.string()).min(1),
    content: z.string().optional(),
  })
  .strict();

export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementSchema>;
