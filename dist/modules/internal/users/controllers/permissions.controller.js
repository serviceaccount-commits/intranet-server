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
exports.PermissionController = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
let PermissionController = class PermissionController {
    permissionService;
    constructor(permissionService) {
        this.permissionService = permissionService;
    }
    async createPermission(req, res) {
        try {
            const { permissionName, appModule } = req.body;
            const permission = await this.permissionService.createPermission(permissionName, appModule);
            res.status(201).json(permission);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async getPermissions(req, res) {
        const { roleId } = req.params;
        if (!roleId) {
            res.status(400).json({ message: 'Role ID is required' });
            return;
        }
        const permissions = await this.permissionService.getOwnAndParentPermissions(roleId);
        res.json(permissions);
    }
};
exports.PermissionController = PermissionController;
exports.PermissionController = PermissionController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IPermissionService)),
    __metadata("design:paramtypes", [Object])
], PermissionController);
//# sourceMappingURL=permissions.controller.js.map