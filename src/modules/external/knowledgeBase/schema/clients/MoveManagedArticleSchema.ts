import { z } from 'zod';

/**
 * Portal "Move article" payload. `targetClientSharedId` is only needed when the
 * destination folder belongs to another client (cross-client move) — the
 * portal asks for a double confirmation before sending it.
 */
export const MoveManagedArticleSchema = z
  .object({
    topicId: z.string().min(1),
    targetClientSharedId: z.string().min(1).optional(),
    actorName: z.string().optional(),
  })
  .strict();

export type MoveManagedArticleInput = z.infer<typeof MoveManagedArticleSchema>;
