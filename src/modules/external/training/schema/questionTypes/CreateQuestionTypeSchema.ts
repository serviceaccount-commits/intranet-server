import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

export const CreateQuestionTypeSchema = z
  .object({
    typeName: z.enum([ES.MULTIPLE_SELECTION, ES.TRUE_FALSE]),
  })
  .strict();

export type CreateQuestionTypeInput = z.infer<typeof CreateQuestionTypeSchema>;
