"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientsRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const clients_controller_1 = require("../controllers/clients.controller");
const permission_middleware_1 = require("../../../internal/auth/middlewares/permission.middleware");
const clientController = inversify_config_1.container.get(clients_controller_1.ClientController);
const clientsRouter = (0, express_1.Router)();
exports.clientsRouter = clientsRouter;
// Creating, editing and deleting clients. The UI already hid these behind the
// permission; the server now enforces it too.
const canManageClients = (0, permission_middleware_1.checkPermission)('kb:client:manage');
clientsRouter.post('/', canManageClients, async (req, res, next) => {
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
clientsRouter.put('/:clientId', canManageClients, async (req, res, next) => {
    try {
        await clientController.updateClient(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Only a client with no folders at all (archived ones included) can go
clientsRouter.delete('/:clientId', canManageClients, async (req, res, next) => {
    try {
        await clientController.deleteClient(req, res);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=clients.router.js.map