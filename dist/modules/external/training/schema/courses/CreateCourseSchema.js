"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCourseSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../../shared/types/enum/ES"));
exports.CreateCourseSchema = zod_1.z
    .object({
    courseName: zod_1.z.string(),
    courseDescription: zod_1.z.string(),
    userId: zod_1.z.string().min(1),
    userIds: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    status: zod_1.z.enum([ES_1.default.PUBLISHED, ES_1.default.DRAFT, ES_1.default.ARCHIVED]),
})
    .strict();
//# sourceMappingURL=CreateCourseSchema.js.map