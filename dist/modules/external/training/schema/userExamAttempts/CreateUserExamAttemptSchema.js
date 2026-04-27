"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserExamAttemptSchema = void 0;
const zod_1 = require("zod");
exports.CreateUserExamAttemptSchema = zod_1.z
    .object({
    examId: zod_1.z.string().min(1),
    answers: zod_1.z.array(zod_1.z.object({
        questionId: zod_1.z.string().min(1),
        optionId: zod_1.z.array(zod_1.z.string().min(1)),
    })),
})
    .strict();
//# sourceMappingURL=CreateUserExamAttemptSchema.js.map