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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const ConflictError_1 = require("../../../../shared/errors/ConflictError");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const CreateClientSchema_1 = require("../schema/clients/CreateClientSchema");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const REGION_1 = __importDefault(require("../../../../shared/types/enum/REGION"));
let ClientService = class ClientService {
    clientRepository;
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async createClient(input, userId) {
        const data = CreateClientSchema_1.CreateClientSchema.parse(input);
        const existing = await this.clientRepository.findByName(data.clientName);
        if (existing) {
            throw new ConflictError_1.ConflictError(`Client "${data.clientName}" already exists.`);
        }
        if (data.isFLX && data.isIM) {
            throw new BusinessLogicError_1.BusinessLogicError('Client cannot be both Flex and IM.');
        }
        if (data.isFLX) {
            const existingFlx = await this.clientRepository.findFLXClient();
            if (existingFlx)
                throw new BusinessLogicError_1.BusinessLogicError('A Flex client already exists.');
        }
        if (data.isIM) {
            const existingIm = await this.clientRepository.findIMClient();
            if (existingIm)
                throw new BusinessLogicError_1.BusinessLogicError('An IM client already exists.');
        }
        const region = data.entity === ES_1.default.PARICUS_LLC ? REGION_1.default.US : REGION_1.default.CO;
        const clientsInRegion = await this.clientRepository.findAllByRegionOrdered(region);
        let sharedIdSuffix = 1;
        if (clientsInRegion.length > 0) {
            const lastClient = clientsInRegion[0];
            if (lastClient) {
                const lastNum = parseInt(lastClient.client_shared_id?.split('_').pop() ?? '0', 10);
                sharedIdSuffix = isNaN(lastNum) ? 1 : lastNum + 1;
            }
        }
        const clientSharedId = `PA_${region.toUpperCase()}_${sharedIdSuffix}`;
        return this.clientRepository.create({
            client_name: data.clientName,
            client_shared_id: clientSharedId,
            region,
            entity: data.entity,
            is_im: data.isIM ?? false,
            is_flx: data.isFLX ?? false,
            client_edit_available: true,
            address: data.address ?? null,
            primary_contact_name: data.primaryContactName ?? null,
            primary_contact_email: data.primaryContactEmail ?? null,
            primary_contact_phone: data.primaryContactPhone ?? null,
            user_id: userId,
        });
    }
    async updateClient(input) {
        const client = await this.clientRepository.findById(input.clientId);
        if (!client)
            throw new NotFoundError_1.NotFoundError('Client', input.clientId);
        client.client_name = input.clientName;
        return this.clientRepository.save(client);
    }
    async getClientsByAccess(userId) {
        return this.clientRepository.findAllWithUserId(userId);
    }
    async getClients() {
        return this.clientRepository.findAll();
    }
    async getFilteredClients(input) {
        return this.clientRepository.findAndCountAllFiltered(input);
    }
    async getClientById(clientId) {
        const client = await this.clientRepository.findById(clientId);
        if (!client)
            throw new NotFoundError_1.NotFoundError('Client', clientId);
        return client;
    }
};
exports.ClientService = ClientService;
exports.ClientService = ClientService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IClientRepository)),
    __metadata("design:paramtypes", [Object])
], ClientService);
//# sourceMappingURL=client.service.js.map