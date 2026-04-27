"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userReportsToRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const userReportsTo_controller_1 = require("../controllers/userReportsTo.controller");
const userReportsToController = inversify_config_1.container.get(userReportsTo_controller_1.UserReportsToController);
const userReportsToRouter = (0, express_1.Router)();
exports.userReportsToRouter = userReportsToRouter;
userReportsToRouter.post('/', async (req, res, next) => {
    try {
        await userReportsToController.createReportsTo(req, res);
    }
    catch (error) {
        next(error);
    }
});
userReportsToRouter.get('/', async (req, res, next) => {
    try {
        await userReportsToController.getReportsTo(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=userReportsTo.router.js.map