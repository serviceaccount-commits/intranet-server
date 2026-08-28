"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClientSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../../shared/types/enum/ES"));
const CURRENCY_1 = __importDefault(require("../../../../../shared/types/enum/CURRENCY"));
// Every field is optional so the UI can send only what changed; clientId
// rides in the route param and is merged in by the controller.
exports.UpdateClientSchema = zod_1.z
    .object({
    clientId: zod_1.z.string().min(1),
    clientName: zod_1.z
        .string()
        .min(2, 'Client name must contain at least 2 characters')
        .optional(),
    // Changing the entity re-derives `region` for display/grouping but NEVER
    // rewrites client_shared_id (PA_US_n / PA_CO_n): that code is the
    // cross-system key (portal users' kbPrefix, KB topics) and must stay
    // stable for the client's lifetime.
    entity: zod_1.z.enum([ES_1.default.PARICUS_LLC, ES_1.default.PARICUS_COLOMBIA]).optional(),
    // Changing the entity does NOT touch the currency: they are separate
    // decisions on purpose.
    currency: zod_1.z.enum([CURRENCY_1.default.COP, CURRENCY_1.default.USD]).optional(),
    address: zod_1.z.string().min(2, 'Address must contain at least 2 characters').optional(),
    primaryContactName: zod_1.z
        .string()
        .min(2, 'Contact name must contain at least 2 characters')
        .optional(),
    primaryContactEmail: zod_1.z
        .string()
        .email('Please provide a valid email address')
        .optional(),
    primaryContactPhone: zod_1.z
        .string()
        .min(7, 'Please provide a valid phone number')
        .optional(),
})
    .strict();
//# sourceMappingURL=UpdateClientSchema.js.map