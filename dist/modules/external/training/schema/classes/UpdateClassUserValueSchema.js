"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClassUserValueSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../../shared/types/enum/ES"));
exports.UpdateClassUserValueSchema = zod_1.z
    .object({
    completionStatus: zod_1.z.enum([ES_1.default.COMPLETED, ES_1.default.INCOMPLETE]),
    className: zod_1.z.string().min(1),
    classDescription: zod_1.z.string().min(1),
    privateComments: zod_1.z.boolean(),
})
    .strict();
//# sourceMappingURL=UpdateClassUserValueSchema.js.map