"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterArticleSchema = exports.ARTICLE_SORT_FIELDS = void 0;
const zod_1 = require("zod");
// Columns the article list can be ordered by. Each maps to a field on the
// unwound version doc inside the aggregation pipeline (see article.repository).
exports.ARTICLE_SORT_FIELDS = [
    'article_name',
    'updated_by_name',
    'updatedAt',
    'article_property',
    'article_status',
];
exports.FilterArticleSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    tagId: zod_1.z
        .union([zod_1.z.coerce.string(), zod_1.z.array(zod_1.z.coerce.string())])
        .optional()
        .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),
    page: zod_1.z.coerce.number().int().optional().default(1),
    limit: zod_1.z.coerce.number().int().optional().default(20),
    sortBy: zod_1.z.enum(exports.ARTICLE_SORT_FIELDS).optional(),
    sortDir: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
//# sourceMappingURL=FilterArticleSchema.js.map