"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const options_controller_1 = require("../controllers/options.controller");
const optionController = inversify_config_1.container.get(options_controller_1.OptionController);
const optionsRouter = (0, express_1.Router)();
exports.optionsRouter = optionsRouter;
optionsRouter.post('/', async (req, res, next) => {
    try {
        await optionController.createOption(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
optionsRouter.put('/:optionId', async (req, res, next) => {
    try {
        await optionController.updateOption(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
optionsRouter.delete('/:optionId', async (req, res, next) => {
    try {
        await optionController.deleteOption(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=options.router.js.map