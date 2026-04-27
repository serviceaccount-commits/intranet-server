"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customFieldsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const customField_controller_1 = require("../controllers/customField.controller");
const customFieldController = inversify_config_1.container.get(customField_controller_1.CustomFieldController);
const customFieldsRouter = (0, express_1.Router)();
exports.customFieldsRouter = customFieldsRouter;
customFieldsRouter.post('/', async (req, res, next) => {
    try {
        await customFieldController.createCustomField(req, res);
    }
    catch (error) {
        next(error);
    }
});
customFieldsRouter.get('/', async (req, res, next) => {
    try {
        await customFieldController.getCustomFields(req, res);
    }
    catch (error) {
        next(error);
    }
});
customFieldsRouter.get('/customFieldId', async (req, res, next) => {
    try {
        await customFieldController.getCustomFieldById(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=assignments.router%20copy.js.map