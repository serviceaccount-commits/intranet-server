"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeTrackerService = void 0;
const inversify_1 = require("inversify");
const appConfig_1 = __importDefault(require("../../../../shared/config/appConfig"));
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const logger_1 = require("../../../../shared/utils/logger");
const SERVICE_PREFIX = '/api/v1/service';
let TimeTrackerService = class TimeTrackerService {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async forward(userId, request) {
        const { apiUrl, apiKey } = appConfig_1.default.timeTracker;
        if (!apiUrl || !apiKey) {
            return {
                status: 503,
                body: {
                    code: 'TIME_TRACKER_NOT_CONFIGURED',
                    message: 'The time tracker integration is not configured.',
                },
            };
        }
        // The acting identity is always the signed-in intranet user's work email,
        // resolved server-side. The tracker stores emails case-insensitively; the
        // intranet does not, so normalize here.
        const user = await this.userService.getUserById(userId);
        const email = user.work_email.trim().toLowerCase();
        const url = new URL(apiUrl + SERVICE_PREFIX + request.path);
        for (const [key, value] of Object.entries(request.query ?? {})) {
            url.searchParams.set(key, value);
        }
        const headers = {
            'X-API-Key': apiKey,
            'X-User-Email': email,
        };
        if (request.body !== undefined) {
            headers['Content-Type'] = 'application/json';
        }
        if (request.idempotencyKey) {
            headers['Idempotency-Key'] = request.idempotencyKey;
        }
        let response;
        try {
            response = await fetch(url, {
                method: request.method,
                headers,
                body: request.body !== undefined ? JSON.stringify(request.body) : undefined,
            });
        }
        catch (error) {
            logger_1.logger.error('Time tracker request failed:', error);
            return {
                status: 502,
                body: {
                    code: 'TIME_TRACKER_UNAVAILABLE',
                    message: 'The time tracker could not be reached.',
                },
            };
        }
        if (response.status === 204) {
            return { status: 204 };
        }
        const body = await response.json().catch(() => ({
            code: 'TIME_TRACKER_ERROR',
            message: 'The time tracker returned an unexpected response.',
        }));
        return { status: response.status, body };
    }
};
exports.TimeTrackerService = TimeTrackerService;
exports.TimeTrackerService = TimeTrackerService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserService)),
    __metadata("design:paramtypes", [Object])
], TimeTrackerService);
//# sourceMappingURL=timeTracker.service.js.map