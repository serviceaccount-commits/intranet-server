"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterUserSchema = void 0;
const zod_1 = require("zod");
const parseQueryBoolean = (val) => {
    if (typeof val !== 'string') {
        // If not a string (e.g., missing param -> undefined), let Zod handle it
        return undefined;
    }
    const lowerVal = val.toLowerCase();
    if (lowerVal === 'true') {
        return true;
    }
    else if (lowerVal === 'false') {
        return false;
    }
    else {
        return 0;
    }
};
exports.FilterUserSchema = zod_1.z.object({
    status: zod_1.z
        .union([zod_1.z.coerce.string(), zod_1.z.array(zod_1.z.coerce.string())])
        .optional()
        .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
    search: zod_1.z.string().optional(),
    selectableAsLeader: zod_1.z.preprocess(parseQueryBoolean, zod_1.z
        .boolean({
        invalid_type_error: "selectableAsLeader must be 'true' or 'false",
    })
        .optional()),
    // Related fields (IDs)
    roleId: zod_1.z
        .union([zod_1.z.coerce.string(), zod_1.z.array(zod_1.z.coerce.string())])
        .optional()
        .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
    clientId: zod_1.z
        .union([zod_1.z.coerce.string(), zod_1.z.array(zod_1.z.coerce.string())])
        .optional()
        .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
    reportsToId: zod_1.z
        .union([zod_1.z.coerce.string(), zod_1.z.array(zod_1.z.coerce.string())])
        .optional()
        .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
    assignmentId: zod_1.z
        .union([zod_1.z.coerce.string(), zod_1.z.array(zod_1.z.coerce.string())])
        .optional()
        .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().default(20),
});
//# sourceMappingURL=FilterUserSchema.js.map