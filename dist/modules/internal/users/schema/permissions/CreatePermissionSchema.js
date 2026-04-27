"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePermissionSchema = void 0;
const zod_1 = require("zod");
exports.CreatePermissionSchema = zod_1.z.object({
    permission_name: zod_1.z.string().min(2),
    app_module: zod_1.z.string().min(2),
});
//# sourceMappingURL=CreatePermissionSchema.js.map