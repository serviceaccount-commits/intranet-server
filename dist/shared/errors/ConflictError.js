"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const AppError_1 = require("./AppError");
class ConflictError extends AppError_1.AppError {
    constructor(message) {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=ConflictError.js.map