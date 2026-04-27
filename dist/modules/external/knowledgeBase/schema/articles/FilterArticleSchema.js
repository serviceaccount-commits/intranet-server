"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterArticleSchema = void 0;
const zod_1 = require("zod");
exports.FilterArticleSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    tagId: zod_1.z
        .union([zod_1.z.coerce.string(), zod_1.z.array(zod_1.z.coerce.string())])
        .optional()
        .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
    page: zod_1.z.coerce.number().int().optional().default(1),
    limit: zod_1.z.coerce.number().int().optional().default(20),
});
//# sourceMappingURL=FilterArticleSchema.js.map