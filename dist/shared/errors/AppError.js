"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        // super(message) must be the first call
        super(message);
        // Set the name for better debugging and identification
        this.name = this.constructor.name;
        // Set your custom property
        this.statusCode = statusCode;
        // No other lines are needed!
    }
}
exports.AppError = AppError;
//# sourceMappingURL=AppError.js.map