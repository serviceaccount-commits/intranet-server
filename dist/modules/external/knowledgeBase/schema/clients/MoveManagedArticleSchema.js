"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveManagedArticleSchema = void 0;
const zod_1 = require("zod");
/**
 * Portal "Move article" payload. `targetClientSharedId` is only needed when the
 * destination folder belongs to another client (cross-client move) — the
 * portal asks for a double confirmation before sending it.
 */
exports.MoveManagedArticleSchema = zod_1.z
    .object({
    topicId: zod_1.z.string().min(1),
    targetClientSharedId: zod_1.z.string().min(1).optional(),
    actorName: zod_1.z.string().optional(),
})
    .strict();
//# sourceMappingURL=MoveManagedArticleSchema.js.map