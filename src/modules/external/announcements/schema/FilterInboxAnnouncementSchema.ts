import { z } from 'zod';
import ES from '../../../../shared/types/enum/ES';

export const FilterInboxAnnouncementSchema = z.object({
  search: z.string().optional(),
  fromId: z
    .union([z.coerce.string(), z.array(z.coerce.string())])
    .optional()
    .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
  preset: z
    .enum([
      'Today',
      'Yesterday',
      'Last-7-days',
      'Last-30-days',
      'Last-2-months',
      'Last-6-months',
    ])
    .optional(),
  priorityLevel: z
    .union([z.coerce.string(), z.array(z.coerce.string())])
    .optional()
    .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined))
    .refine(
      (val) => {
        if (val) {
          const newVal = val[0]?.split(',') ? val[0]?.split(',') : [];
          return newVal.every(
            (level) =>
              level === ES.HIGH || level === ES.MEDIUM || level === ES.LOW,
          );
        }
        return true;
      },
      {
        message: `Invalid priority level. Must be one of ${ES.HIGH}, ${ES.MEDIUM}, ${ES.LOW}`,
      },
    ),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});

export type FilterInboxAnnouncementInput = z.infer<
  typeof FilterInboxAnnouncementSchema
>;
