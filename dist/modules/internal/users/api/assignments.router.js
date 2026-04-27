"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const assignments_controller_1 = require("../controllers/assignments.controller");
const assignmentController = inversify_config_1.container.get(assignments_controller_1.AssignmentController);
const assignmentsRouter = (0, express_1.Router)();
exports.assignmentsRouter = assignmentsRouter;
assignmentsRouter.post('/', async (req, res, next) => {
    try {
        await assignmentController.createAssignment(req, res);
    }
    catch (error) {
        next(error);
    }
});
assignmentsRouter.get('/', async (req, res, next) => {
    try {
        await assignmentController.getAssignments(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=assignments.router.js.map