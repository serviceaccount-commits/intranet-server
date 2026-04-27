"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsupportedMediaTypeError = void 0;
const AppError_1 = require("./AppError");
class UnsupportedMediaTypeError extends AppError_1.AppError {
    constructor(mediaType) {
        super(`Unsupported media type: ${mediaType}`, 400);
    }
}
exports.UnsupportedMediaTypeError = UnsupportedMediaTypeError;
//# sourceMappingURL=UnsupportedMediaType.js.map