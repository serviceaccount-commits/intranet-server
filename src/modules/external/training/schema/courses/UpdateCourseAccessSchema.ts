import { z } from 'zod';

export const UpdateCourseAccessSchema = z.object({
  userIds: z.array(z.string().uuid()),
});

export type UpdateCourseAccessInput = z.infer<typeof UpdateCourseAccessSchema>;
