import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';
import CURRENCY from '../../../../../shared/types/enum/CURRENCY';

// Every field is optional so the UI can send only what changed; clientId
// rides in the route param and is merged in by the controller.
export const UpdateClientSchema = z
  .object({
    clientId: z.string().min(1),
    clientName: z
      .string()
      .min(2, 'Client name must contain at least 2 characters')
      .optional(),
    // Changing the entity re-derives `region` for display/grouping but NEVER
    // rewrites client_shared_id (PA_US_n / PA_CO_n): that code is the
    // cross-system key (portal users' kbPrefix, KB topics) and must stay
    // stable for the client's lifetime.
    entity: z.enum([ES.PARICUS_LLC, ES.PARICUS_COLOMBIA]).optional(),
    // Changing the entity does NOT touch the currency: they are separate
    // decisions on purpose.
    currency: z.enum([CURRENCY.COP, CURRENCY.USD]).optional(),
    address: z.string().min(2, 'Address must contain at least 2 characters').optional(),
    primaryContactName: z
      .string()
      .min(2, 'Contact name must contain at least 2 characters')
      .optional(),
    primaryContactEmail: z
      .string()
      .email('Please provide a valid email address')
      .optional(),
    primaryContactPhone: z
      .string()
      .min(7, 'Please provide a valid phone number')
      .optional(),
  })
  .strict();

export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
