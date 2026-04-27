"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExamSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../../shared/types/enum/ES"));
exports.UpdateExamSchema = zod_1.z
    .object({
    passingScore: zod_1.z.number().min(1),
    maxAttempts: zod_1.z.number().min(1),
    examStatus: zod_1.z.enum([ES_1.default.PUBLISHED, ES_1.default.DRAFT, ES_1.default.OUTDATED]),
})
    .strict();
//# sourceMappingURL=UpdateExamSchema.js.map