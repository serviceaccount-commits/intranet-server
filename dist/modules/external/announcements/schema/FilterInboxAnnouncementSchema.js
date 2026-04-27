"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterInboxAnnouncementSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
exports.FilterInboxAnnouncementSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    fromId: zod_1.z
        .union([zod_1.z.coerce.string(), zod_1.z.array(zod_1.z.coerce.string())])
        .optional()
        .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
    preset: zod_1.z
        .enum([
        'Today',
        'Yesterday',
        'Last-7-days',
        'Last-30-days',
        'Last-2-months',
        'Last-6-months',
    ])
        .optional(),
    priorityLevel: zod_1.z
        .union([zod_1.z.coerce.string(), zod_1.z.array(zod_1.z.coerce.string())])
        .optional()
        .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined))
        .refine((val) => {
        if (val) {
            console.log('VAL: ', val);
            const newVal = val[0]?.split(',') ? val[0]?.split(',') : [];
            return newVal.every((level) => level === ES_1.default.HIGH || level === ES_1.default.MEDIUM || level === ES_1.default.LOW);
        }
        return true;
    }, {
        message: `Invalid priority level. Must be one of ${ES_1.default.HIGH}, ${ES_1.default.MEDIUM}, ${ES_1.default.LOW}`,
    }),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().default(20),
});
//# sourceMappingURL=FilterInboxAnnouncementSchema.js.map