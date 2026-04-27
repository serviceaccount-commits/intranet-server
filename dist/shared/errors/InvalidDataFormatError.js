"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDataFormatError = void 0;
const AppError_1 = require("./AppError");
class InvalidDataFormatError extends AppError_1.AppError {
    constructor(resourceName) {
        super(`Invalid ${resourceName} format.`, 400);
    }
}
exports.InvalidDataFormatError = InvalidDataFormatError;
//# sourceMappingURL=InvalidDataFormatError.js.map