"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionRepository = void 0;
const inversify_1 = require("inversify");
const Permission_entity_1 = require("../entities/Permission.entity");
const data_source_1 = require("../../../../shared/database/data-source");
const typeorm_1 = require("typeorm");
let PermissionRepository = class PermissionRepository {
    async create(permission) {
        return await data_source_1.AppDataSource.manager.save(permission);
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(Permission_entity_1.Permission, {
            where: { permission_id: id },
        });
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(Permission_entity_1.Permission);
    }
    async findAllByRoleId(roleId) {
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(Permission_entity_1.Permission, 'p')
            .leftJoin('p.roles', 'r')
            .where('r.role_id = :roleId', { roleId })
            .getMany();
    }
    async findAllByIds(permissionIds) {
        return await data_source_1.AppDataSource.manager.find(Permission_entity_1.Permission, {
            where: { permission_id: (0, typeorm_1.In)(permissionIds) },
        });
    }
};
exports.PermissionRepository = PermissionRepository;
exports.PermissionRepository = PermissionRepository = __decorate([
    (0, inversify_1.injectable)()
], PermissionRepository);
//# sourceMappingURL=permission.repository.js.map