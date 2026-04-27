"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategorySchema = void 0;
const zod_1 = require("zod");
exports.CreateCategorySchema = zod_1.z
    .object({
    categoryName: zod_1.z.string().min(1),
    clientId: zod_1.z.string().min(1),
    userId: zod_1.z.string().min(1).optional(),
})
    .strict();
//# sourceMappingURL=CreateCategorySchema.js.map