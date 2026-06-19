import { z } from 'zod';

/**
 * Inputs for the portal-facing folder (topic) write API
 * (`/v1/external/manage/topics`). The client is resolved from the
 * `clientSharedId` path param, so it is not part of the body. `actorName` is
 * the display name of the portal user performing the action — portal users are
 * not intranet users, so there is no `userId`.
 */

export const CreateManagedTopicSchema = z
  .object({
    topicName: z.string().min(1).max(200).trim(),
    /** When present, the new folder is created as a sub-folder of the given
     *  parent. Parent must belong to the same client. */
    parentTopicId: z.string().uuid().nullable().optional(),
    actorName: z.string().min(1).max(200),
  })
  .strict();
export type CreateManagedTopicInput = z.infer<typeof CreateManagedTopicSchema>;

export const UpdateManagedTopicSchema = z
  .object({
    topicName: z.string().min(1).max(200).trim().optional(),
    /** When the key is present, move the folder. `null` means "promote to root
     *  of the client". Omit the key entirely to leave the parent untouched. */
    parentTopicId: z.string().uuid().nullable().optional(),
    actorName: z.string().min(1).max(200),
  })
  .strict()
  .refine(
    (data) =>
      data.topicName !== undefined || data.parentTopicId !== undefined,
    { message: 'At least one of topicName or parentTopicId must be provided' },
  );
export type UpdateManagedTopicInput = z.infer<typeof UpdateManagedTopicSchema>;
