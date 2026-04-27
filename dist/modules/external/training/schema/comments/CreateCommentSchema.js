"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommentSchema = void 0;
const zod_1 = require("zod");
exports.CreateCommentSchema = zod_1.z
    .object({
    userId: zod_1.z.string().min(1),
    commentContent: zod_1.z.string().min(1),
    commentStatus: zod_1.z.string().min(1),
})
    .strict();
//# sourceMappingURL=CreateCommentSchema.js.map