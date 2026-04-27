import { z } from 'zod';

export const CreateQuestionSchema = z
  .object({
    examId: z.string().min(1),
  })
  .strict();

export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;
