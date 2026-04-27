"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategorySchema = void 0;
const zod_1 = require("zod");
exports.UpdateCategorySchema = zod_1.z
    .object({
    categoryName: zod_1.z.string().min(1),
    categoryId: zod_1.z.string().min(1),
})
    .strict();
//# sourceMappingURL=UpdateCategorySchema.js.map