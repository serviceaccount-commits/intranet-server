import { z } from 'zod';

/**
 * Inputs for the portal-facing write API (`/v1/external/manage/articles`).
 * `actorName` is the display name of the portal user performing the action,
 * recorded as `updated_by_name` since portal users are not intranet users.
 */

export const CreateManagedArticleSchema = z
  .object({
    topicId: z.string().uuid(),
    articleName: z.string().min(2).max(500).trim(),
    content: z.string().default(''),
    synopsis: z.string().max(2000).optional(),
    actorName: z.string().min(1).max(200),
  })
  .strict();
export type CreateManagedArticleInput = z.infer<typeof CreateManagedArticleSchema>;

export const UpdateManagedArticleSchema = z
  .object({
    content: z.string().optional(),
    articleName: z.string().min(2).max(500).trim().optional(),
    synopsis: z.string().max(2000).optional(),
    actorName: z.string().min(1).max(200),
  })
  .strict();
export type UpdateManagedArticleInput = z.infer<typeof UpdateManagedArticleSchema>;
