"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTopicSchema = void 0;
const zod_1 = require("zod");
exports.CreateTopicSchema = zod_1.z
    .object({
    topicName: zod_1.z.string().min(1),
    clientId: zod_1.z.string().min(1),
    userId: zod_1.z.string().min(1).optional(),
    /** Optional — when present, the new topic is created as a sub-folder of
     *  the given parent. Parent must belong to the same `clientId`. */
    parentTopicId: zod_1.z.string().uuid().nullable().optional(),
})
    .strict();
//# sourceMappingURL=CreateTopicSchema.js.map