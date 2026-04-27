"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sdOrderRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const staffDirectoryOrders_controller_1 = require("../controllers/staffDirectoryOrders.controller");
const sdOrderController = inversify_config_1.container.get(staffDirectoryOrders_controller_1.StaffDirectoryOrderController);
const sdOrderRouter = (0, express_1.Router)();
exports.sdOrderRouter = sdOrderRouter;
sdOrderRouter.post('/', async (req, res, next) => {
    try {
        await sdOrderController.createStaffDirectoryOrder(req, res);
    }
    catch (error) {
        next(error);
    }
});
sdOrderRouter.get('/', async (req, res, next) => {
    try {
        await sdOrderController.getStaffDirectoryOrder(req, res);
    }
    catch (error) {
        next(error);
    }
});
sdOrderRouter.delete('/:staffDirectoryOrderId', async (req, res, next) => {
    try {
        await sdOrderController.deleteStaffDirectoryOrderById(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=staffDirectoryOrders.router.js.map