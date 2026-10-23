"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeTrackingRouter = void 0;
const express_1 = require("express");
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
timeTrackingRouter.post('/me/timer/start', handle((req, res) => controller.startTimer(req, res)));
timeTrackingRouter.post('/me/timer/stop', handle((req, res) => controller.stopTimer(req, res)));
//# sourceMappingURL=timeTracking.router.js.map