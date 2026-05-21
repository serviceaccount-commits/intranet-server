import { z } from 'zod';

export const CreateTopicSchema = z
  .object({
    topicName: z.string().min(1),
    clientId: z.string().min(1),
    userId: z.string().min(1).optional(),
    /** Optional — when present, the new topic is created as a sub-folder of
     *  the given parent. Parent must belong to the same `clientId`. */
    parentTopicId: z.string().uuid().nullable().optional(),
  })
  .strict();

export type CreateTopicInput = z.infer<typeof CreateTopicSchema>;
