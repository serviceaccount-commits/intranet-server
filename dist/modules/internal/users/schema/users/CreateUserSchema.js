"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../../shared/types/enum/ES"));
exports.CreateUserSchema = zod_1.z
    .object({
    // User fields
    firstName: zod_1.z
        .string({ required_error: 'First name is required' })
        .min(2, 'First name must contain at least 2 characters'),
    lastName: zod_1.z
        .string({ required_error: 'Last name is requried' })
        .min(2, 'Last name must be at least 2 characters'),
    workEmail: zod_1.z
        .string({ required_error: 'Work email is required' })
        .email('Please provide a valid email address'),
    workPhone: zod_1.z
        .string({ required_error: 'Work phone is required' })
        .min(7, 'Please enter a valid phone number'),
    selectableAsLeader: zod_1.z.boolean({
        required_error: 'Leader selection is required',
    }),
    jobTitle: zod_1.z
        .string({ required_error: 'Job title is required' })
        .min(2, 'Job title seems too short'),
    status: zod_1.z.enum([ES_1.default.ACTIVE, ES_1.default.INACTIVE]).optional(),
    // User Details fields
    personalEmail: zod_1.z
        .string({ required_error: 'Personal email is required' })
        .email('Please provide a valid email address'),
    personalPhone: zod_1.z
        .string({ required_error: 'Personal phone is required' })
        .min(7, 'Please enter a valid phone number'),
    residentialCountry: zod_1.z
        .string({ required_error: 'Country of residence is required' })
        .min(2),
    countryNationality: zod_1.z
        .string({ required_error: 'Nationality is required' })
        .min(2),
    emergencyContactName: zod_1.z
        .string({ required_error: 'Emergency contact name is required' })
        .min(2),
    emergencyContactPhone: zod_1.z
        .string({ required_error: 'Emergency contact phone is required' })
        .min(7, 'Please enter a valid phone number'),
    hireDate: zod_1.z.string({ required_error: 'Hire date is required' }).min(1),
    // Relationship IDs
    roleId: zod_1.z.string({ required_error: 'A role must be assigned' }).min(1),
    clientIds: zod_1.z.array(zod_1.z.string().min(1)),
    assignmentIds: zod_1.z.array(zod_1.z.string().min(1)),
    reportsToId: zod_1.z
        .string({ required_error: 'Please select who this user reports to' })
        .min(1),
})
    .strict();
//# sourceMappingURL=CreateUserSchema.js.map