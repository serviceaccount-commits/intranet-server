"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentError = void 0;
const ConfigError_1 = require("./ConfigError");
class EnvironmentError extends ConfigError_1.ConfigError {
    constructor(message) {
        super(message, 400);
    }
}
exports.EnvironmentError = EnvironmentError;
//# sourceMappingURL=EnvironmentError.js.map