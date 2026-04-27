import { z } from 'zod';

export const FilterAnnouncementReportSchema = z.object({
  status: z
    .union([z.coerce.string(), z.array(z.coerce.string())])
    .optional()
    .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
  search: z.string().optional(),

  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});

export type FilterAnnouncementReportInput = z.infer<
  typeof FilterAnnouncementReportSchema
>;
