"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffDirectoryOrderRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const StaffDirectoryOrder_entity_1 = require("../entities/StaffDirectoryOrder.entity");
let StaffDirectoryOrderRepository = class StaffDirectoryOrderRepository {
    async create(staffDirectoryOrder) {
        return await data_source_1.AppDataSource.manager.save(staffDirectoryOrder);
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(StaffDirectoryOrder_entity_1.StaffDirectoryOrder);
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(StaffDirectoryOrder_entity_1.StaffDirectoryOrder, {
            where: {
                order_id: id,
            },
        });
    }
    async findByName(name) {
        return await data_source_1.AppDataSource.manager.findOne(StaffDirectoryOrder_entity_1.StaffDirectoryOrder, {
            where: {
                column_name: name,
            },
        });
    }
    async deleteById(staffDirectoryOrderId) {
        const staffDirectoryOrder = await this.findById(staffDirectoryOrderId);
        if (!staffDirectoryOrder) {
            throw new Error(`Staff Directory Order with id ${staffDirectoryOrderId} not found`);
        }
        await data_source_1.AppDataSource.manager.remove(staffDirectoryOrder);
    }
};
exports.StaffDirectoryOrderRepository = StaffDirectoryOrderRepository;
exports.StaffDirectoryOrderRepository = StaffDirectoryOrderRepository = __decorate([
    (0, inversify_1.injectable)()
], StaffDirectoryOrderRepository);
//# sourceMappingURL=staffDirectoryOrder.repository.js.map