"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileReadingError = void 0;
const ConfigError_1 = require("./ConfigError");
class FileReadingError extends ConfigError_1.ConfigError {
    constructor(message) {
        super(message, 400);
    }
}
exports.FileReadingError = FileReadingError;
//# sourceMappingURL=FileReadingError.js.map