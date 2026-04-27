import { z } from 'zod';

export const CreateOptionSchema = z
  .object({
    questionId: z.string().min(1),
  })
  .strict();

export type CreateOptionInput = z.infer<typeof CreateOptionSchema>;
