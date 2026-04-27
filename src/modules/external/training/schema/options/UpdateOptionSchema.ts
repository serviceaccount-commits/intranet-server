import { z } from 'zod';

export const UpdateOptionSchema = z
  .object({
    examId: z.string().min(1),
    questionId: z.string().min(1),
    optionText: z.string().min(1),
    isCorrect: z.boolean(),
  })
  .strict();

export type UpdateOptionInput = z.infer<typeof UpdateOptionSchema>;
