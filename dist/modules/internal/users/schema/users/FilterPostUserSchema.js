"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterPostUserSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../../shared/types/enum/ES"));
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
exports.FilterPostUserSchema = zod_1.z.object({
    status: zod_1.z.enum([ES_1.default.ACTIVE, ES_1.default.INACTIVE]).optional(),
    selectableAsLeader: zod_1.z.preprocess(parseQueryBoolean, zod_1.z
        .boolean({
        invalid_type_error: "selectableAsLeader must be 'true' or 'false",
    })
        .optional()),
    // Related fields (IDs)
    roleId: zod_1.z.coerce.string().min(1).optional(),
    clientIds: zod_1.z.array(zod_1.z.coerce.string().min(1)).optional(),
    assignmentIds: zod_1.z.array(zod_1.z.coerce.string().min(1)).optional(),
    reportsToId: zod_1.z.coerce.string().min(1).optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().default(20),
});
//# sourceMappingURL=FilterPostUserSchema.js.map