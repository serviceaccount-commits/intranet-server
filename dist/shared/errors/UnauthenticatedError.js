"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthenticatedError = void 0;
const AppError_1 = require("./AppError");
class UnauthenticatedError extends AppError_1.AppError {
    constructor(message = 'User not authenticatd') {
        super(message, 401);
    }
}
exports.UnauthenticatedError = UnauthenticatedError;
//# sourceMappingURL=UnauthenticatedError.js.map