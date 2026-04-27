"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClassSchema = void 0;
const zod_1 = require("zod");
exports.CreateClassSchema = zod_1.z
    .object({
    userId: zod_1.z.string(),
    className: zod_1.z.string(),
    classDescription: zod_1.z.string(),
    privateComments: zod_1.z.boolean(),
    topicId: zod_1.z.string().min(1),
    content: zod_1.z.string(),
})
    .strict();
//# sourceMappingURL=CreateClassSchema.js.map