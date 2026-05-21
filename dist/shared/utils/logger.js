"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const isDev = process.env['NODE_ENV'] !== 'production';
exports.logger = {
    info: (msg, ...args) => console.info(`[INFO]  ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[WARN]  ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
    debug: (msg, ...args) => { if (isDev)
        console.debug(`[DEBUG] ${msg}`, ...args); },
};
//# sourceMappingURL=logger.js.map