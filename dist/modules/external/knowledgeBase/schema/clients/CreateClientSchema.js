"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClientSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../../shared/types/enum/ES"));
exports.CreateClientSchema = zod_1.z
    .object({
    clientName: zod_1.z
        .string()
        .min(2, 'Client name must contain at least 2 characters'),
    isIM: zod_1.z.boolean().optional(),
    isFLX: zod_1.z.boolean().optional(),
    entity: zod_1.z.enum([ES_1.default.PARICUS_LLC, ES_1.default.PARICUS_COLOMBIA]),
    address: zod_1.z.string().min(2, 'Address must contain at least 2 characters'),
    primaryContactName: zod_1.z
        .string()
        .min(2, 'Contact name must contain at least 2 characters'),
    primaryContactEmail: zod_1.z
        .string()
        .email('Please provide a valid email address'),
    primaryContactPhone: zod_1.z
        .string()
        .min(7, 'Please provide a valid phone number'),
})
    .strict();
//# sourceMappingURL=CreateClientSchema.js.map