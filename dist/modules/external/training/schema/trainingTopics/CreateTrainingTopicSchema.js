"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTrainingTopicSchema = void 0;
const zod_1 = require("zod");
exports.CreateTrainingTopicSchema = zod_1.z
    .object({
    topicName: zod_1.z.string(),
    courseId: zod_1.z.string().min(1),
})
    .strict();
//# sourceMappingURL=CreateTrainingTopicSchema.js.map