"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationError = void 0;
const AppError_1 = require("./AppError");
class AuthenticationError extends AppError_1.AppError {
    constructor(message) {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
//# sourceMappingURL=AuthenticationError.js.map