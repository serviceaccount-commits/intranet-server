"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTopicSchema = void 0;
const zod_1 = require("zod");
exports.UpdateTopicSchema = zod_1.z
    .object({
    topicId: zod_1.z.string().min(1),
    topicName: zod_1.z.string().min(1).optional(),
    /** When the key is present, move the topic. `null` means "promote to root
     *  of the client". Omit the key entirely to leave the parent untouched. */
    parentTopicId: zod_1.z.string().uuid().nullable().optional(),
})
    .strict()
    .refine((data) => data.topicName !== undefined || data.parentTopicId !== undefined, { message: 'At least one of topicName or parentTopicId must be provided' });
//# sourceMappingURL=UpdateTopicSchema.js.map