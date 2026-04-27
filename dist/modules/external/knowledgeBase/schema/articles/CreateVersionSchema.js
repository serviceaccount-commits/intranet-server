"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVersionSchema = void 0;
const zod_1 = require("zod");
exports.CreateVersionSchema = zod_1.z.object({
    versionId: zod_1.z.string(),
    useVersionAsTemplate: zod_1.z.boolean(),
});
//# sourceMappingURL=CreateVersionSchema.js.map