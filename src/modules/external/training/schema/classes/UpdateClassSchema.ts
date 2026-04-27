import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

export const UpdateClassSchema = z
  .object({
    className: z.string().min(1),
    classDescription: z.string(),
    privateComments: z.boolean(),
    classStatus: z.enum([ES.PUBLISHED, ES.DRAFT, ES.ARCHIVED]),
    content: z.string().min(1),
  })
  .strict();

export type UpdateClassInput = z.infer<typeof UpdateClassSchema>;
