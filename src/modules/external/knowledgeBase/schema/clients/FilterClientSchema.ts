import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

export const FilterClientSchema = z.object({
  search: z.string().optional(),
  entity: z.enum([ES.PARICUS_COLOMBIA, ES.PARICUS_LLC]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});

export type FilterClientInput = z.infer<typeof FilterClientSchema>;
