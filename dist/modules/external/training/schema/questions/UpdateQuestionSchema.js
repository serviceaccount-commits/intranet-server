"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuestionSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../../shared/types/enum/ES"));
exports.UpdateQuestionSchema = zod_1.z
    .object({
    examId: zod_1.z.string().min(1),
    questionType: zod_1.z.enum([ES_1.default.MULTIPLE_SELECTION, ES_1.default.TRUE_FALSE]),
    questionText: zod_1.z.string(),
})
    .strict();
//# sourceMappingURL=UpdateQuestionSchema.js.map