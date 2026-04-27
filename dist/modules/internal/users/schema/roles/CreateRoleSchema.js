"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoleSchema = void 0;
const zod_1 = require("zod");
exports.CreateRoleSchema = zod_1.z
    .object({
    roleName: zod_1.z.string().min(1),
    roleDescription: zod_1.z.string().min(1),
    roleId: zod_1.z.string().min(1),
})
    .strict();
//# sourceMappingURL=CreateRoleSchema.js.map