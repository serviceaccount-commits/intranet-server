"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const questions_controller_1 = require("../controllers/questions.controller");
const questionController = inversify_config_1.container.get(questions_controller_1.QuestionController);
const questionRouter = (0, express_1.Router)();
exports.questionRouter = questionRouter;
questionRouter.post('/', async (req, res, next) => {
    try {
        await questionController.createQuestion(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
questionRouter.put('/:questionId', async (req, res, next) => {
    try {
        await questionController.updateQuestion(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
questionRouter.delete('/:questionId', async (req, res, next) => {
    try {
        await questionController.deleteQuestion(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=questions.router.js.map