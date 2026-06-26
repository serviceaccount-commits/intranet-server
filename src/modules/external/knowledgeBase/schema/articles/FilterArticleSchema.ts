import { z } from 'zod';

// Columns the article list can be ordered by. Each maps to a field on the
// unwound version doc inside the aggregation pipeline (see article.repository).
export const ARTICLE_SORT_FIELDS = [
  'article_name',
  'updated_by_name',
  'updatedAt',
  'article_property',
  'article_status',
] as const;

export const FilterArticleSchema = z.object({
  search: z.string().optional(),
  tagId: z
    .union([z.coerce.string(), z.array(z.coerce.string())])
    .optional()
    .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),

  page: z.coerce.number().int().optional().default(1),
  limit: z.coerce.number().int().optional().default(20),

  sortBy: z.enum(ARTICLE_SORT_FIELDS).optional(),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ArticleSortField = (typeof ARTICLE_SORT_FIELDS)[number];

export type FilterArticleInput = z.infer<typeof FilterArticleSchema>;
