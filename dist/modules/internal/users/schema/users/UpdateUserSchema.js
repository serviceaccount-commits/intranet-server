"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../../shared/types/enum/ES"));
exports.UpdateUserSchema = zod_1.z
    .object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    workEmail: zod_1.z.string().email(),
    workPhone: zod_1.z.string().min(1),
    selectableAsLeader: zod_1.z.boolean(),
    jobTitle: zod_1.z.string().min(1),
    status: zod_1.z.enum([ES_1.default.ACTIVE, ES_1.default.INACTIVE]).optional(),
    // User Details fields
    personalEmail: zod_1.z.string().email(),
    personalPhone: zod_1.z.string().min(1),
    residentialCountry: zod_1.z.string().min(1),
    countryNationality: zod_1.z.string().min(1),
    emergencyContactName: zod_1.z.string().min(1),
    emergencyContactPhone: zod_1.z.string().min(1),
    hireDate: zod_1.z.string().min(1),
    reHirable: zod_1.z.boolean().optional(),
    // Relationship IDs
    roleId: zod_1.z.string().min(1),
    clientIds: zod_1.z.array(zod_1.z.string().min(1)),
    assignmentIds: zod_1.z.array(zod_1.z.string().min(1)),
    reportsToId: zod_1.z.string().min(1),
})
    .strict();
//# sourceMappingURL=UpdateUserSchema.js.map