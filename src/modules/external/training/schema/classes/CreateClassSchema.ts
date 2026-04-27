import { z } from 'zod';

export const CreateClassSchema = z
  .object({
    userId: z.string(),
    className: z.string(),
    classDescription: z.string(),
    privateComments: z.boolean(),
    topicId: z.string().min(1),
    content: z.string(),
  })
  .strict();

export type CreateClassInput = z.infer<typeof CreateClassSchema>;
