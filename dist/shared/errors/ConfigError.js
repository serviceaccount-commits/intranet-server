"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigError = void 0;
class ConfigError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ConfigError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ConfigError = ConfigError;
//# sourceMappingURL=ConfigError.js.map