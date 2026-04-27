"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userExamAttemptRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const userExamAttempts_controller_1 = require("../controllers/userExamAttempts.controller");
const userExamAttemptController = inversify_config_1.container.get(userExamAttempts_controller_1.UserExamAttemptController);
const userExamAttemptRouter = (0, express_1.Router)();
exports.userExamAttemptRouter = userExamAttemptRouter;
userExamAttemptRouter.post('/', async (req, res, next) => {
    try {
        await userExamAttemptController.submitExamAnswers(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
userExamAttemptRouter.get('/:attemptId', async (req, res, next) => {
    try {
        await userExamAttemptController.getUserExamAnswers(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=userExamAttempts.router.js.map