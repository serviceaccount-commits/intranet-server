"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOptionSchema = void 0;
const zod_1 = require("zod");
exports.CreateOptionSchema = zod_1.z
    .object({
    questionId: zod_1.z.string().min(1),
})
    .strict();
//# sourceMappingURL=CreateOptionSchema.js.map