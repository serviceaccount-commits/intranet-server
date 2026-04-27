import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

export const UpdateExamSchema = z
  .object({
    passingScore: z.number().min(1),
    maxAttempts: z.number().min(1),
    examStatus: z.enum([ES.PUBLISHED, ES.DRAFT, ES.OUTDATED]),
  })
  .strict();

export type UpdateExamInput = z.infer<typeof UpdateExamSchema>;
