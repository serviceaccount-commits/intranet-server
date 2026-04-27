"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTrainingTopicSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../../shared/types/enum/ES"));
exports.UpdateTrainingTopicSchema = zod_1.z
    .object({
    topicName: zod_1.z.string().min(1),
    topicStatus: zod_1.z
        .enum([ES_1.default.ACTIVE, ES_1.default.INACTIVE, ES_1.default.PUBLISHED, ES_1.default.DRAFT, ES_1.default.ARCHIVED])
        .optional(),
})
    .strict();
//# sourceMappingURL=UpdateTraingTopicSchema.js.map