import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

const parseQueryBoolean = (val: unknown): unknown => {
  if (typeof val !== 'string') {
    // If not a string (e.g., missing param -> undefined), let Zod handle it
    return undefined;
  }
  const lowerVal = val.toLowerCase();
  if (lowerVal === 'true') {
    return true;
  } else if (lowerVal === 'false') {
    return false;
  } else {
    return 0;
  }
};

export const FilterPostUserSchema = z.object({
  status: z.enum([ES.ACTIVE, ES.INACTIVE]).optional(),
  selectableAsLeader: z.preprocess(
    parseQueryBoolean,
    z
      .boolean({
        invalid_type_error: "selectableAsLeader must be 'true' or 'false",
      })
      .optional(),
  ),

  // Related fields (IDs)
  roleId: z.coerce.string().min(1).optional(),
  clientIds: z.array(z.coerce.string().min(1)).optional(),
  assignmentIds: z.array(z.coerce.string().min(1)).optional(),
  reportsToId: z.coerce.string().min(1).optional(),

  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});

export type FilterPostUserInput = z.infer<typeof FilterPostUserSchema>;
