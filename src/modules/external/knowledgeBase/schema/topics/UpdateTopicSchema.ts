import { z } from 'zod';

export const UpdateTopicSchema = z
  .object({
    topicId: z.string().min(1),
    topicName: z.string().min(1).optional(),
    /** When the key is present, move the topic. `null` means "promote to root
     *  of the client". Omit the key entirely to leave the parent untouched. */
    parentTopicId: z.string().uuid().nullable().optional(),
  })
  .strict()
  .refine(
    (data) => data.topicName !== undefined || data.parentTopicId !== undefined,
    { message: 'At least one of topicName or parentTopicId must be provided' },
  );

export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;
