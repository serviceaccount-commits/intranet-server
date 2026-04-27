"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const clients_controller_1 = require("../controllers/clients.controller");
const clientController = inversify_config_1.container.get(clients_controller_1.ClientController);
const clientsRouter = (0, express_1.Router)();
exports.clientsRouter = clientsRouter;
clientsRouter.post('/', async (req, res, next) => {
    try {
        await clientController.createClient(req, res);
    }
    catch (error) {
        next(error);
    }
});
clientsRouter.get('/', async (req, res, next) => {
    try {
        await clientController.getClientsByAccess(req, res);
    }
    catch (error) {
        next(error);
    }
});
clientsRouter.get('/all', async (req, res, next) => {
    try {
        await clientController.getClients(req, res);
    }
    catch (error) {
        next(error);
    }
});
clientsRouter.get('/all/filters', async (req, res, next) => {
    try {
        await clientController.getClientsFilters(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
clientsRouter.get('/:clientId', async (req, res, next) => {
    try {
        await clientController.getClientById(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=clients.router.js.map