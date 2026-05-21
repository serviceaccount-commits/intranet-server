"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalClientsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const clients_controller_1 = require("../controllers/clients.controller");
const clientController = inversify_config_1.container.get(clients_controller_1.ClientController);
const externalClientsRouter = (0, express_1.Router)();
exports.externalClientsRouter = externalClientsRouter;
externalClientsRouter.get('/', async (req, res, next) => {
    try {
        await clientController.getExternalClients(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=external-clients.router.js.map