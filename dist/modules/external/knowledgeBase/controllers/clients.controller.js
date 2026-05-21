"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const FilterClientSchema_1 = require("../schema/clients/FilterClientSchema");
const zod_1 = require("zod");
let ClientController = class ClientController {
    clientService;
    constructor(clientService) {
        this.clientService = clientService;
    }
    async createClient(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        const input = req.body;
        await this.clientService.createClient(input, userId);
        res.sendStatus(201);
    }
    async getClients(_req, res) {
        const clients = await this.clientService.getClients();
        res.json(clients);
    }
    async getClientsFilters(req, res, next) {
        try {
            const validationResult = FilterClientSchema_1.FilterClientSchema.parse(req.query);
            const userId = req.user?.id;
            if (!userId) {
                res.sendStatus(400);
                return;
            }
            const result = await this.clientService.getFilteredClients(validationResult);
            return res.json({
                data: result,
                pagination: {
                    totalItems: result.total,
                    currentPage: validationResult.page,
                    itemsPerPage: validationResult.limit,
                    totalPages: Math.ceil(result.total / validationResult.limit),
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            next(error);
        }
    }
    async getClientsByAccess(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        const clients = await this.clientService.getClientsByAccess(userId);
        res.json(clients);
    }
    async getClientById(req, res) {
        const { clientId } = req.params;
        if (!clientId) {
            res.sendStatus(400);
            return;
        }
        const client = await this.clientService.getClientById(clientId);
        res.json(client);
    }
    async getExternalClients(_req, res) {
        const clients = await this.clientService.getClients();
        const minimal = clients
            .filter((c) => c.client_shared_id)
            .map((c) => ({
            client_shared_id: c.client_shared_id,
            client_name: c.client_name,
        }))
            .sort((a, b) => a.client_shared_id.localeCompare(b.client_shared_id));
        res.json(minimal);
    }
};
exports.ClientController = ClientController;
exports.ClientController = ClientController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IClientService)),
    __metadata("design:paramtypes", [Object])
], ClientController);
//# sourceMappingURL=clients.controller.js.map