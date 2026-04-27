"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterAnnouncementReportSchema = void 0;
const zod_1 = require("zod");
exports.FilterAnnouncementReportSchema = zod_1.z.object({
    status: zod_1.z
        .union([zod_1.z.coerce.string(), zod_1.z.array(zod_1.z.coerce.string())])
        .optional()
        .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().default(20),
});
//# sourceMappingURL=FilterAnnouncementReportSchema.js.map