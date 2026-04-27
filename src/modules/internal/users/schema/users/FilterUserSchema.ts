import { z } from 'zod';

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

export const FilterUserSchema = z.object({
  status: z
    .union([z.coerce.string(), z.array(z.coerce.string())])
    .optional()
    .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
  search: z.string().optional(),
  selectableAsLeader: z.preprocess(
    parseQueryBoolean,
    z
      .boolean({
        invalid_type_error: "selectableAsLeader must be 'true' or 'false",
      })
      .optional(),
  ),

  // Related fields (IDs)
  roleId: z
    .union([z.coerce.string(), z.array(z.coerce.string())])
    .optional()
    .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
  clientId: z
    .union([z.coerce.string(), z.array(z.coerce.string())])
    .optional()
    .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
  reportsToId: z
    .union([z.coerce.string(), z.array(z.coerce.string())])
    .optional()
    .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
  assignmentId: z
    .union([z.coerce.string(), z.array(z.coerce.string())])
    .optional()
    .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),

  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});

export type FilterUserInput = z.infer<typeof FilterUserSchema>;
