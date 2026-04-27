import { z } from 'zod';

export const CreateCommentSchema = z
  .object({
    userId: z.string().min(1),
    commentContent: z.string().min(1),
    commentStatus: z.string().min(1),
  })
  .strict();

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
