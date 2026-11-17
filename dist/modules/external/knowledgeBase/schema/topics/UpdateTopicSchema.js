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
    /** Move the folder, with its subfolders and articles, to this client.
     *  `parentTopicId` is then a folder of that client (`null`/absent = its
     *  root). Same client as today = a plain move. */
    targetClientId: zod_1.z.string().uuid().optional(),
    /** The staff member asking (set by the controller, never from the body):
     *  a cross-client move needs access to both clients. */
    userId: zod_1.z.string().optional(),
})
    .strict()
    .refine((data) => data.topicName !== undefined ||
    data.parentTopicId !== undefined ||
    data.targetClientId !== undefined, {
    message: 'At least one of topicName, parentTopicId or targetClientId must be provided',
});
//# sourceMappingURL=UpdateTopicSchema.js.map