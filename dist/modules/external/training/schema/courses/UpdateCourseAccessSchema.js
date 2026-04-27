"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCourseAccessSchema = void 0;
const zod_1 = require("zod");
exports.UpdateCourseAccessSchema = zod_1.z.object({
    userIds: zod_1.z.array(zod_1.z.string().uuid()),
});
//# sourceMappingURL=UpdateCourseAccessSchema.js.map