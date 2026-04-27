import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

export const CreateClientSchema = z
  .object({
    clientName: z
      .string()
      .min(2, 'Client name must contain at least 2 characters'),
    isIM: z.boolean().optional(),
    isFLX: z.boolean().optional(),
    entity: z.enum([ES.PARICUS_LLC, ES.PARICUS_COLOMBIA]),
    address: z.string().min(2, 'Address must contain at least 2 characters'),
    primaryContactName: z
      .string()
      .min(2, 'Contact name must contain at least 2 characters'),
    primaryContactEmail: z
      .string()
      .email('Please provide a valid email address'),
    primaryContactPhone: z
      .string()
      .min(7, 'Please provide a valid phone number'),
  })
  .strict();

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
