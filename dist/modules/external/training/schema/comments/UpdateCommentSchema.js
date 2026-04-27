"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCommentSchema = void 0;
const zod_1 = require("zod");
exports.UpdateCommentSchema = zod_1.z
    .object({
    commentContent: zod_1.z.string().min(1),
    commentStatus: zod_1.z.string().min(1),
})
    .strict();
//# sourceMappingURL=UpdateCommentSchema.js.map