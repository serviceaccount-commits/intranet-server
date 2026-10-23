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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeTrackerController = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
/**
 * Thin proxy to the Paricus Time Tracker's service API. Statuses and bodies
 * (problem+json codes like DAY_CLOSED or SERVICE_USER_NOT_FOUND) pass through
 * untouched so the frontend reacts to the tracker's own contract.
 */
let TimeTrackerController = class TimeTrackerController {
    timeTracker;
    constructor(timeTracker) {
        this.timeTracker = timeTracker;
    }
    async act(req, res, request) {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        this.send(res, await this.timeTracker.forward(userId, request));
    }
    send(res, upstream) {
        if (upstream.status === 204) {
            res.sendStatus(204);
            return;
        }
        res.status(upstream.status).json(upstream.body);
    }
    idempotencyKey(req) {
        return req.header('Idempotency-Key') || undefined;
    }
    entryId(req) {
        const id = Number(req.params['entryId']);
        return Number.isInteger(id) && id > 0 ? id : null;
    }
    async getTimesheet(req, res) {
        const week = String(req.query['week'] ?? '');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) {
            res.status(400).json({ message: 'week must be a YYYY-MM-DD date' });
            return;
        }
        await this.act(req, res, {
            method: 'GET',
            path: '/me/timesheet',
            query: { week },
        });
    }
    async createEntry(req, res) {
        await this.act(req, res, {
            method: 'POST',
            path: '/time-entries',
            body: req.body,
            idempotencyKey: this.idempotencyKey(req),
        });
    }
    async updateEntry(req, res) {
        const entryId = this.entryId(req);
        if (entryId === null) {
            res.status(400).json({ message: 'entryId must be a positive integer' });
            return;
        }
        await this.act(req, res, {
            method: 'PATCH',
            path: `/time-entries/${entryId}`,
            body: req.body,
        });
    }
    async deleteEntry(req, res) {
        const entryId = this.entryId(req);
        const version = Number(req.query['version']);
        if (entryId === null || !Number.isInteger(version) || version < 1) {
            res.status(400).json({
                message: 'entryId and version must be positive integers',
            });
            return;
        }
        await this.act(req, res, {
            method: 'DELETE',
            path: `/time-entries/${entryId}`,
            query: { version: String(version) },
        });
    }
    async submit(req, res) {
        await this.act(req, res, {
            method: 'POST',
            path: '/me/submissions',
            body: req.body,
            idempotencyKey: this.idempotencyKey(req),
        });
    }
    async requestUnlock(req, res) {
        await this.act(req, res, {
            method: 'POST',
            path: '/unlock-requests',
            body: req.body,
            idempotencyKey: this.idempotencyKey(req),
        });
    }
    async unlockReasons(req, res) {
        await this.act(req, res, {
            method: 'GET',
            path: '/edit-reasons',
            query: { applies_to: 'unlock' },
        });
    }
    async handoff(req, res) {
        await this.act(req, res, {
            method: 'POST',
            path: '/handoff',
        });
    }
    async startTimer(req, res) {
        await this.act(req, res, {
            method: 'POST',
            path: '/me/timer/start',
            body: req.body,
            idempotencyKey: this.idempotencyKey(req),
        });
    }
    async stopTimer(req, res) {
        await this.act(req, res, {
            method: 'POST',
            path: '/me/timer/stop',
            idempotencyKey: this.idempotencyKey(req),
        });
    }
};
exports.TimeTrackerController = TimeTrackerController;
exports.TimeTrackerController = TimeTrackerController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ITimeTrackerService)),
    __metadata("design:paramtypes", [Object])
], TimeTrackerController);
//# sourceMappingURL=timeTracker.controller.js.map