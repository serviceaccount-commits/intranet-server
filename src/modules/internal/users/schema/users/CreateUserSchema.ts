import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

export const CreateUserSchema = z
  .object({
    // User fields
    firstName: z
      .string({ required_error: 'First name is required' })
      .min(2, 'First name must contain at least 2 characters'),
    lastName: z
      .string({ required_error: 'Last name is requried' })
      .min(2, 'Last name must be at least 2 characters'),
    workEmail: z
      .string({ required_error: 'Work email is required' })
      .email('Please provide a valid email address'),
    workPhone: z
      .string({ required_error: 'Work phone is required' })
      .min(7, 'Please enter a valid phone number'),
    selectableAsLeader: z.boolean({
      required_error: 'Leader selection is required',
    }),
    jobTitle: z
      .string({ required_error: 'Job title is required' })
      .min(2, 'Job title seems too short'),
    status: z.enum([ES.ACTIVE, ES.INACTIVE]).optional(),

    // User Details fields
    personalEmail: z
      .string({ required_error: 'Personal email is required' })
      .email('Please provide a valid email address'),
    personalPhone: z
      .string({ required_error: 'Personal phone is required' })
      .min(7, 'Please enter a valid phone number'),
    residentialCountry: z
      .string({ required_error: 'Country of residence is required' })
      .min(2),
    countryNationality: z
      .string({ required_error: 'Nationality is required' })
      .min(2),
    emergencyContactName: z
      .string({ required_error: 'Emergency contact name is required' })
      .min(2),
    emergencyContactPhone: z
      .string({ required_error: 'Emergency contact phone is required' })
      .min(7, 'Please enter a valid phone number'),
    hireDate: z.string({ required_error: 'Hire date is required' }).min(1),

    // Relationship IDs
    roleId: z.string({ required_error: 'A role must be assigned' }).min(1),
    clientIds: z.array(z.string().min(1)),
    assignmentIds: z.array(z.string().min(1)),
    reportsToId: z
      .string({ required_error: 'Please select who this user reports to' })
      .min(1),
  })
  .strict();

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
