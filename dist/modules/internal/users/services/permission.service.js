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
exports.PermissionService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const Permission_entity_1 = require("../entities/Permission.entity");
const data_source_1 = require("../../../../shared/database/data-source");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
let PermissionService = class PermissionService {
    permissionRepository;
    roleRepository;
    constructor(permissionRepository, roleRepository) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
    }
    async createPermission(name, appModule) {
        if (!name || !appModule) {
            throw new Error('name or module missing');
        }
        return await data_source_1.AppDataSource.manager.transaction(async (_transactionalEntityManager) => {
            const permission = new Permission_entity_1.Permission();
            permission.app_module = appModule;
            return await this.permissionRepository.create(permission);
        });
    }
    async getPermissions(roleId) {
        const role = await this.roleRepository.findById(roleId);
        if (!role) {
            throw new NotFoundError_1.NotFoundError('Role', roleId);
        }
        return role.permissions;
    }
    async getOwnAndParentPermissions(roleId) {
        const role = await this.roleRepository.findByIdWithParent(roleId);
        if (!role) {
            throw new NotFoundError_1.NotFoundError('Role', roleId);
        }
        const permissions = role.permissions;
        if (!role.parentRole) {
            return {
                rolePermissions: permissions.map((permission) => permission.permission_id),
                parentPermissions: [],
            };
        }
        const parentPermissions = role.parentRole.permissions;
        console.log('PARENT ROLE: ');
        console.log(role.parentRole);
        const permissionsIds = permissions.map((permission) => permission.permission_id);
        const parentPermissionsIds = parentPermissions.map((permission) => permission.permission_id);
        return {
            rolePermissions: permissionsIds,
            parentPermissions: parentPermissionsIds,
        };
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IPermissionRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IRoleRepository)),
    __metadata("design:paramtypes", [Object, Object])
], PermissionService);
//# sourceMappingURL=permission.service.js.map