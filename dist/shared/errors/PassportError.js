"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassportEror = void 0;
const AppError_1 = require("./AppError");
class PassportEror extends AppError_1.AppError {
    constructor(message) {
        super(message, 400);
    }
}
exports.PassportEror = PassportEror;
//# sourceMappingURL=PassportError.js.map