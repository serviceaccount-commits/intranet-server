import { z } from 'zod';

export const FilterArticleSchema = z.object({
  search: z.string().optional(),
  tagId: z
    .union([z.coerce.string(), z.array(z.coerce.string())])
    .optional()
    .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),

  page: z.coerce.number().int().optional().default(1),
  limit: z.coerce.number().int().optional().default(20),
});

export type FilterArticleInput = z.infer<typeof FilterArticleSchema>;
