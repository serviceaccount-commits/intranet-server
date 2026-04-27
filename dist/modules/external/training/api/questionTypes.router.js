"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionTypesRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const questionTypes_controller_1 = require("../controllers/questionTypes.controller");
const questionTypesController = inversify_config_1.container.get(questionTypes_controller_1.QuestionTypeController);
const questionTypesRouter = (0, express_1.Router)();
exports.questionTypesRouter = questionTypesRouter;
questionTypesRouter.post('/', async (req, res, next) => {
    try {
        await questionTypesController.createQuestionType(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=questionTypes.router.js.map