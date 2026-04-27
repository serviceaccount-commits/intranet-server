import { z } from 'zod';

export const UpdateTopicSchema = z
  .object({
    topicName: z.string().min(1),
    topicId: z.string().min(1),
  })
  .strict();

export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;
