import { z } from 'zod';

export const UpdateTopicSchema = z
  .object({
    topicId: z.string().min(1),
    topicName: z.string().min(1).optional(),
    /** When the key is present, move the topic. `null` means "promote to root
     *  of the client". Omit the key entirely to leave the parent untouched. */
    parentTopicId: z.string().uuid().nullable().optional(),
    /** Move the folder, with its subfolders and articles, to this client.
     *  `parentTopicId` is then a folder of that client (`null`/absent = its
     *  root). Same client as today = a plain move. */
    targetClientId: z.string().uuid().optional(),
    /** The staff member asking (set by the controller, never from the body):
     *  a cross-client move needs access to both clients. */
    userId: z.string().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.topicName !== undefined ||
      data.parentTopicId !== undefined ||
      data.targetClientId !== undefined,
    {
      message:
        'At least one of topicName, parentTopicId or targetClientId must be provided',
    },
  );

export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;
