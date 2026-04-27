"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessValidationError = void 0;
const AppError_1 = require("./AppError");
class BusinessValidationError extends AppError_1.AppError {
    errors;
    constructor(message, errors) {
        super(message, 400);
        this.name = 'BusinessValidationError';
        this.errors = errors;
    }
}
exports.BusinessValidationError = BusinessValidationError;
//# sourceMappingURL=BusinessValidationError.js.map