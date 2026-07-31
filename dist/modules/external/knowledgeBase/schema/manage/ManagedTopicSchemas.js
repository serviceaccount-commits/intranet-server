"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateManagedTopicSchema = exports.CreateManagedTopicSchema = void 0;
const zod_1 = require("zod");
/**
 * Inputs for the portal-facing folder (topic) write API
 * (`/v1/external/manage/topics`). The client is resolved from the
 * `clientSharedId` path param, so it is not part of the body. `actorName` is
 * the display name of the portal user performing the action — portal users are
 * not intranet users, so there is no `userId`.
 */
exports.CreateManagedTopicSchema = zod_1.z
    .object({
    topicName: zod_1.z.string().min(1).max(200).trim(),
    /** When present, the new folder is created as a sub-folder of the given
     *  parent. Parent must belong to the same client. */
    parentTopicId: zod_1.z.string().uuid().nullable().optional(),
    actorName: zod_1.z.string().min(1).max(200),
})
    .strict();
exports.UpdateManagedTopicSchema = zod_1.z
    .object({
    topicName: zod_1.z.string().min(1).max(200).trim().optional(),
    /** When the key is present, move the folder. `null` means "promote to root
     *  of the client". Omit the key entirely to leave the parent untouched. */
    parentTopicId: zod_1.z.string().uuid().nullable().optional(),
    actorName: zod_1.z.string().min(1).max(200),
})
    .strict()
    .refine((data) => data.topicName !== undefined || data.parentTopicId !== undefined, { message: 'At least one of topicName or parentTopicId must be provided' });
//# sourceMappingURL=ManagedTopicSchemas.js.map