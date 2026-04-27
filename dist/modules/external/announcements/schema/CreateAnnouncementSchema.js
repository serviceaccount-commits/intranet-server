"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAnnouncementSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
exports.CreateAnnouncementSchema = zod_1.z
    .object({
    // User fields
    priorityLevel: zod_1.z.enum([ES_1.default.HIGH, ES_1.default.MEDIUM, ES_1.default.LOW]),
    type: zod_1.z.enum([ES_1.default.REGULAR, ES_1.default.PERSISTENT]),
    title: zod_1.z.string().min(1),
    preview: zod_1.z.string().optional(),
    userIds: zod_1.z.array(zod_1.z.string()).min(1),
    content: zod_1.z.string().optional(),
})
    .strict();
//# sourceMappingURL=CreateAnnouncementSchema.js.map