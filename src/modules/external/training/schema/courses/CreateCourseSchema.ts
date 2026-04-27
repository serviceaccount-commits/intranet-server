import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

export const CreateCourseSchema = z
  .object({
    courseName: z.string(),
    courseDescription: z.string(),
    userId: z.string().min(1),
    userIds: z.array(z.string().min(1)).optional(),
    status: z.enum([ES.PUBLISHED, ES.DRAFT, ES.ARCHIVED]),
  })
  .strict();

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
