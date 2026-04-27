"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTopicSchema = void 0;
const zod_1 = require("zod");
exports.UpdateTopicSchema = zod_1.z
    .object({
    topicName: zod_1.z.string().min(1),
    topicId: zod_1.z.string().min(1),
})
    .strict();
//# sourceMappingURL=UpdateTopicSchema.js.map