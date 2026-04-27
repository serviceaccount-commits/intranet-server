import { z } from 'zod';

export const CreateTopicSchema = z
  .object({
    topicName: z.string().min(1),
    clientId: z.string().min(1),
    userId: z.string().min(1).optional(),
  })
  .strict();

export type CreateTopicInput = z.infer<typeof CreateTopicSchema>;
