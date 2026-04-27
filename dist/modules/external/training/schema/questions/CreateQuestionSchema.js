"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuestionSchema = void 0;
const zod_1 = require("zod");
exports.CreateQuestionSchema = zod_1.z
    .object({
    examId: zod_1.z.string().min(1),
})
    .strict();
//# sourceMappingURL=CreateQuestionSchema.js.map