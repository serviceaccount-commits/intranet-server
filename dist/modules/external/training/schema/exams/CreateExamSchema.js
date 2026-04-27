"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateExamSchema = void 0;
const zod_1 = require("zod");
exports.CreateExamSchema = zod_1.z
    .object({
    classId: zod_1.z.string().min(1),
    referenceExamId: zod_1.z.string().optional(),
})
    .strict();
//# sourceMappingURL=CreateExamSchema.js.map