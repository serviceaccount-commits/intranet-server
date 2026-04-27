import { z } from 'zod';

export const CreateExamSchema = z
  .object({
    classId: z.string().min(1),
    referenceExamId: z.string().optional(),
  })
  .strict();

export type CreateExamInput = z.infer<typeof CreateExamSchema>;
