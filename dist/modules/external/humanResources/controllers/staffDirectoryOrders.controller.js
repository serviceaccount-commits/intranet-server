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
exports.StaffDirectoryOrderController = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
let StaffDirectoryOrderController = class StaffDirectoryOrderController {
    staffDirectoryService;
    constructor(staffDirectoryService) {
        this.staffDirectoryService = staffDirectoryService;
    }
    async createStaffDirectoryOrder(req, res) {
        let { order, columnName, isCustom } = req.body;
        const newAssignment = await this.staffDirectoryService.createStaffDirectoryOrder(order, columnName, isCustom);
        res.status(201).json(newAssignment);
    }
    async getStaffDirectoryOrder(_req, res) {
        res.json(await this.staffDirectoryService.getStaffDirectoryOrder());
    }
    async deleteStaffDirectoryOrderById(req, res) {
        const { staffDirectoryOrderId } = req.params;
        await this.staffDirectoryService.deleteStaffDirectoryOrderById(Number(staffDirectoryOrderId));
        res.sendStatus(204);
    }
};
exports.StaffDirectoryOrderController = StaffDirectoryOrderController;
exports.StaffDirectoryOrderController = StaffDirectoryOrderController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IStaffDirectoryOrderService)),
    __metadata("design:paramtypes", [Object])
], StaffDirectoryOrderController);
//# sourceMappingURL=staffDirectoryOrders.controller.js.map