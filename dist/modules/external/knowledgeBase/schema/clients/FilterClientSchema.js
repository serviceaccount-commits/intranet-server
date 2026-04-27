"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterClientSchema = void 0;
const zod_1 = require("zod");
const ES_1 = __importDefault(require("../../../../../shared/types/enum/ES"));
exports.FilterClientSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    entity: zod_1.z.enum([ES_1.default.PARICUS_COLOMBIA, ES_1.default.PARICUS_LLC]).optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().default(20),
});
//# sourceMappingURL=FilterClientSchema.js.map