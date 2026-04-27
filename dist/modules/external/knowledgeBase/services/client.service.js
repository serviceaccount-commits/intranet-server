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
const Client_entity_1 = require("../entities/Client.entity");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const ConflictError_1 = require("../../../../shared/errors/ConflictError");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const CreateClientSchema_1 = require("../schema/clients/CreateClientSchema");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const REGION_1 = __importDefault(require("../../../../shared/types/enum/REGION"));
let ClientService = class ClientService {
    clientRepository;
    userRepository;
    constructor(clientRepository, userRepository) {
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
    }
    async createClient(input, userId) {
        const validatedData = CreateClientSchema_1.CreateClientSchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const exisitingClient = await this.clientRepository.findByName(validatedData.clientName);
            if (exisitingClient) {
                throw new ConflictError_1.ConflictError(`Client with name ${validatedData.clientName} already exists.`);
            }
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new NotFoundError_1.NotFoundError('User', userId);
            }
            const clientRegion = validatedData.entity === ES_1.default.PARICUS_LLC ? REGION_1.default.US : REGION_1.default.CO;
            const clientsWithRegion = await this.clientRepository.findAllByRegionOrdered(clientRegion);
            let client_shared_id = `PA_${clientRegion.toUpperCase()}_`;
            if (clientsWithRegion.length === 0) {
                client_shared_id += '1';
            }
            else {
                const firstClient = clientsWithRegion[0];
                if (firstClient) {
                    const lastNumber = parseInt(firstClient.client_shared_id?.split('_').pop() || '0');
                    client_shared_id += lastNumber + 1;
                }
            }
            if (validatedData.isFLX && validatedData.isIM) {
                throw new BusinessLogicError_1.BusinessLogicError('Client can not be both Flex and IM');
            }
            if (validatedData.isFLX) {
                const existingFlex = await this.clientRepository.findFLXClient();
                if (existingFlex) {
                    throw new BusinessLogicError_1.BusinessLogicError('Flex client already exists');
                }
            }
            if (validatedData.isIM) {
                const existingIM = await this.clientRepository.findIMClient();
                if (existingIM) {
                    throw new BusinessLogicError_1.BusinessLogicError('IM client already exists');
                }
            }
            const newClient = new Client_entity_1.Client();
            newClient.client_name = validatedData.clientName;
            newClient.region = clientRegion;
            newClient.client_shared_id = client_shared_id;
            newClient.is_flx = validatedData.isFLX || false;
            newClient.is_im = validatedData.isIM || false;
            newClient.entity = validatedData.entity;
            newClient.address = validatedData.address;
            newClient.primary_contact_name = validatedData.primaryContactName;
            newClient.primary_contact_email = validatedData.primaryContactEmail;
            newClient.primary_contact_phone = validatedData.primaryContactPhone;
            const client = await this.clientRepository.create(newClient, user);
            user.clients = [...(user.clients || []), client];
            await this.userRepository.saveUser(user);
            return client;
        });
    }
    async updateClient(input) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const client = await this.clientRepository.findById(input.clientId);
            if (!client) {
                throw new NotFoundError_1.NotFoundError('Client', input.clientId);
            }
            client.client_name = input.clientName;
            return await this.clientRepository.save(client);
        });
    }
    async getClientsByAccess(userId) {
        return await this.clientRepository.findAllWithUserId(userId);
    }
    async getClients() {
        return await this.clientRepository.findAll();
    }
    async getFilteredClients(input) {
        return await this.clientRepository.findAndCountAllFiltered(input);
    }
    async getClientById(clientId) {
        const client = await this.clientRepository.findById(clientId);
        if (!client) {
            throw new NotFoundError_1.NotFoundError('Client', clientId);
        }
        return client;
    }
};
exports.ClientService = ClientService;
exports.ClientService = ClientService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IClientRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __metadata("design:paramtypes", [Object, Object])
], ClientService);
//# sourceMappingURL=client.service.js.map