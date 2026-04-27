import { z } from 'zod';

export const CreateVersionSchema = z.object({
  versionId: z.string(),
  useVersionAsTemplate: z.boolean(),
});

export type CreateVersionInput = z.infer<typeof CreateVersionSchema>;
