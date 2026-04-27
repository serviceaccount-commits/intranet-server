import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

export const UpdateCourseSchema = z
  .object({
    courseName: z.string().min(1),
    courseDescription: z.string(),
    userIds: z.array(z.string().min(1)),
    status: z.enum([ES.PUBLISHED, ES.DRAFT, ES.ARCHIVED]),
  })
  .strict();

export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
