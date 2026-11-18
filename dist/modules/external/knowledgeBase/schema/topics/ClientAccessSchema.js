"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientAccessSchema = void 0;
const zod_1 = require("zod");
/**
 * The whole "Manage access" screen of one client, saved at once: who is on the
 * client, and the list of every folder shown. `allowed: null` (or an empty
 * list) leaves the folder open to everyone on the client.
 */
exports.ClientAccessSchema = zod_1.z
    .object({
    members: zod_1.z.array(zod_1.z.string().uuid()).max(2000),
    folders: zod_1.z
        .array(zod_1.z
        .object({
        topic_id: zod_1.z.string().uuid(),
        allowed: zod_1.z.array(zod_1.z.string().uuid()).max(2000).nullable(),
    })
        .strict())
        .max(1000),
})
    .strict();
//# sourceMappingURL=ClientAccessSchema.js.map