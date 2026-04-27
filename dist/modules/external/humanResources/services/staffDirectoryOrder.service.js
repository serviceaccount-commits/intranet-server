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
exports.StaffDirectoryOrderService = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const StaffDirectoryOrder_entity_1 = require("../entities/StaffDirectoryOrder.entity");
let StaffDirectoryOrderService = class StaffDirectoryOrderService {
    staffDirectoryOrderRepository;
    constructor(staffDirectoryOrderRepository) {
        this.staffDirectoryOrderRepository = staffDirectoryOrderRepository;
    }
    async createStaffDirectoryOrder(order, columnName, isCustom) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const existingStaffOrder = await this.staffDirectoryOrderRepository.findByName(columnName);
            if (existingStaffOrder) {
                throw new Error(`Staff Directory Order with name ${columnName} already exists.`);
            }
            const newStaffDirectoryOrder = new StaffDirectoryOrder_entity_1.StaffDirectoryOrder();
            newStaffDirectoryOrder.order = order;
            newStaffDirectoryOrder.column_name = columnName;
            newStaffDirectoryOrder.is_custom = isCustom;
            return await this.staffDirectoryOrderRepository.create(newStaffDirectoryOrder);
        });
    }
    async getStaffDirectoryOrder() {
        return await this.staffDirectoryOrderRepository.findAll();
    }
    async deleteStaffDirectoryOrderById(staffDirectoryOrderId) {
        await this.staffDirectoryOrderRepository.deleteById(staffDirectoryOrderId);
    }
};
exports.StaffDirectoryOrderService = StaffDirectoryOrderService;
exports.StaffDirectoryOrderService = StaffDirectoryOrderService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IStaffDirectoryOrderRepository)),
    __metadata("design:paramtypes", [Object])
], StaffDirectoryOrderService);
//# sourceMappingURL=staffDirectoryOrder.service.js.map