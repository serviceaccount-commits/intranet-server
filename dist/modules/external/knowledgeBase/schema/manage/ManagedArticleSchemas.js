"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateManagedArticleSchema = exports.CreateManagedArticleSchema = void 0;
const zod_1 = require("zod");
/**
 * Inputs for the portal-facing write API (`/v1/external/manage/articles`).
 * `actorName` is the display name of the portal user performing the action,
 * recorded as `updated_by_name` since portal users are not intranet users.
 */
exports.CreateManagedArticleSchema = zod_1.z
    .object({
    topicId: zod_1.z.string().uuid(),
    articleName: zod_1.z.string().min(2).max(500).trim(),
    content: zod_1.z.string().default(''),
    synopsis: zod_1.z.string().max(2000).optional(),
    actorName: zod_1.z.string().min(1).max(200),
})
    .strict();
exports.UpdateManagedArticleSchema = zod_1.z
    .object({
    content: zod_1.z.string().optional(),
    articleName: zod_1.z.string().min(2).max(500).trim().optional(),
    synopsis: zod_1.z.string().max(2000).optional(),
    actorName: zod_1.z.string().min(1).max(200),
})
    .strict();
//# sourceMappingURL=ManagedArticleSchemas.js.map