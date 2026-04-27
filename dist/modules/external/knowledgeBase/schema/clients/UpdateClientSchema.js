"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClientSchema = void 0;
const zod_1 = require("zod");
exports.UpdateClientSchema = zod_1.z
    .object({
    clientName: zod_1.z.string().min(1),
    clientId: zod_1.z.string().min(1),
})
    .strict();
//# sourceMappingURL=UpdateClientSchema.js.map