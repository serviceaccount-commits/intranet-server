"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveArticleSchema = void 0;
const zod_1 = require("zod");
exports.MoveArticleSchema = zod_1.z
    .object({
    articleIds: zod_1.z.array(zod_1.z.string()).min(1),
    topicId: zod_1.z.string(),
})
    .strict();
//# sourceMappingURL=MoveArticleSchema.js.map