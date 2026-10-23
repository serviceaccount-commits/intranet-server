"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeTrackingRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const timeTracker_controller_1 = require("../controllers/timeTracker.controller");
const controller = inversify_config_1.container.get(timeTracker_controller_1.TimeTrackerController);
const timeTrackingRouter = (0, express_1.Router)();
exports.timeTrackingRouter = timeTrackingRouter;
const handle = (fn) => async (req, res, next) => {
    try {
        await fn(req, res);
    }
    catch (error) {
        next(error);
    }
};
timeTrackingRouter.get('/me/timesheet', handle((req, res) => controller.getTimesheet(req, res)));
timeTrackingRouter.post('/time-entries', handle((req, res) => controller.createEntry(req, res)));
timeTrackingRouter.patch('/time-entries/:entryId', handle((req, res) => controller.updateEntry(req, res)));
timeTrackingRouter.delete('/time-entries/:entryId', handle((req, res) => controller.deleteEntry(req, res)));
timeTrackingRouter.post('/me/submissions', handle((req, res) => controller.submit(req, res)));
timeTrackingRouter.post('/unlock-requests', handle((req, res) => controller.requestUnlock(req, res)));
timeTrackingRouter.get('/unlock-reasons', handle((req, res) => controller.unlockReasons(req, res)));
timeTrackingRouter.post('/handoff', handle((req, res) => controller.handoff(req, res)));
// Same caps as the tracker (3 images of 3 MB at most), so an oversized upload is cut off here
// instead of being buffered and forwarded. Kept in memory: it only passes through.
const MAX_REPORT_IMAGES = 3;
const reportUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024,
        files: MAX_REPORT_IMAGES,
        fields: 4,
        fieldSize: 16 * 1024,
    },
}).array('images', MAX_REPORT_IMAGES);
const withReportUpload = (req, res, next) => reportUpload(req, res, (error) => {
    if (error instanceof multer_1.default.MulterError) {
        // The tracker's problem+json shape, so the module shows it like any other tracker error.
        res.status(422).json({
            type: 'about:blank',
            title: 'Attachment not accepted',
            status: 422,
            code: 'INVALID_ATTACHMENT',
            detail: error.code === 'LIMIT_FILE_SIZE'
                ? 'Each image must be under 3 MB.'
                : `Attach up to ${MAX_REPORT_IMAGES} images.`,
        });
        return;
    }
    if (error) {
        next(error);
        return;
    }
    next();
});
timeTrackingRouter.post('/error-reports', withReportUpload, handle((req, res) => controller.reportProblem(req, res)));
timeTrackingRouter.post('/me/timer/start', handle((req, res) => controller.startTimer(req, res)));
timeTrackingRouter.post('/me/timer/stop', handle((req, res) => controller.stopTimer(req, res)));
//# sourceMappingURL=timeTracking.router.js.map