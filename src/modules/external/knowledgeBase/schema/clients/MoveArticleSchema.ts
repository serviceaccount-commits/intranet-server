import { z } from 'zod';

export const MoveArticleSchema = z
  .object({
    articleIds: z.array(z.string()).min(1),
    topicId: z.string(),
  })
  .strict();

export type MoveArticleInput = z.infer<typeof MoveArticleSchema>;
