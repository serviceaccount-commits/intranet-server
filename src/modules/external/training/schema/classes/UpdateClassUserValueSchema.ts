import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

export const UpdateClassUserValueSchema = z
  .object({
    completionStatus: z.enum([ES.COMPLETED, ES.INCOMPLETE]),

    className: z.string().min(1),
    classDescription: z.string().min(1),
    privateComments: z.boolean(),
  })
  .strict();

export type UpdateClassUserValueInput = z.infer<
  typeof UpdateClassUserValueSchema
>;
