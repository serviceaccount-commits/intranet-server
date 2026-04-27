"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessLogicError = void 0;
const AppError_1 = require("./AppError");
class BusinessLogicError extends AppError_1.AppError {
    constructor(message) {
        super(message, 400);
    }
}
exports.BusinessLogicError = BusinessLogicError;
//# sourceMappingURL=BusinessLogicError.js.map