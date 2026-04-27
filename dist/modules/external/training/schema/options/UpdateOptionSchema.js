"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOptionSchema = void 0;
const zod_1 = require("zod");
exports.UpdateOptionSchema = zod_1.z
    .object({
    examId: zod_1.z.string().min(1),
    questionId: zod_1.z.string().min(1),
    optionText: zod_1.z.string().min(1),
    isCorrect: zod_1.z.boolean(),
})
    .strict();
//# sourceMappingURL=UpdateOptionSchema.js.map