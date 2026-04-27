import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

export const UpdateUserSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    workEmail: z.string().email(),
    workPhone: z.string().min(1),
    selectableAsLeader: z.boolean(),
    jobTitle: z.string().min(1),
    status: z.enum([ES.ACTIVE, ES.INACTIVE]).optional(),

    // User Details fields
    personalEmail: z.string().email(),
    personalPhone: z.string().min(1),
    residentialCountry: z.string().min(1),
    countryNationality: z.string().min(1),
    emergencyContactName: z.string().min(1),
    emergencyContactPhone: z.string().min(1),
    hireDate: z.string().min(1),
    reHirable: z.boolean().optional(),

    // Relationship IDs
    roleId: z.string().min(1),
    clientIds: z.array(z.string().min(1)),
    assignmentIds: z.array(z.string().min(1)),
    reportsToId: z.string().min(1),
  })
  .strict();

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
