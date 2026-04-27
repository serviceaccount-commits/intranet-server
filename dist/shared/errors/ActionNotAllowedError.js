"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionNotAllowedError = void 0;
const AppError_1 = require("./AppError");
class ActionNotAllowedError extends AppError_1.AppError {
    constructor(message = 'Not enough permissions to perform this action.') {
        super(message, 403);
    }
}
exports.ActionNotAllowedError = ActionNotAllowedError;
//# sourceMappingURL=ActionNotAllowedError.js.map