import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

export const UpdateQuestionSchema = z
  .object({
    examId: z.string().min(1),
    questionType: z.enum([ES.MULTIPLE_SELECTION, ES.TRUE_FALSE]),
    questionText: z.string(),
  })
  .strict();

export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;
