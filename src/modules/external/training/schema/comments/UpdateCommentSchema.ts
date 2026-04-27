import { z } from 'zod';

export const UpdateCommentSchema = z
  .object({
    commentContent: z.string().min(1),
    commentStatus: z.string().min(1),
  })
  .strict();

export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
