"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClassSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../../shared/types/enum/ES"));
exports.UpdateClassSchema = zod_1.z
    .object({
    className: zod_1.z.string().min(1),
    classDescription: zod_1.z.string(),
    privateComments: zod_1.z.boolean(),
    classStatus: zod_1.z.enum([ES_1.default.PUBLISHED, ES_1.default.DRAFT, ES_1.default.ARCHIVED]),
    content: zod_1.z.string().min(1),
})
    .strict();
//# sourceMappingURL=UpdateClassSchema.js.map