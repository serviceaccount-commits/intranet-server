"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
const data_source_1 = require("../../../../shared/database/data-source");
const Role_entity_1 = require("../entities/Role.entity");
const inversify_1 = require("inversify");
let RoleRepository = class RoleRepository {
    async create(role, permissions) {
        role.permissions = permissions;
        return await data_source_1.AppDataSource.manager.save(role);
    }
    async save(role) {
        return await data_source_1.AppDataSource.manager.save(role);
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(Role_entity_1.Role, {
            where: { role_id: id },
            relations: {
                permissions: true,
                users: true,
                baseRole: true,
                parentRole: true,
            },
        });
    }
    async findByIdWithParent(id) {
        return await data_source_1.AppDataSource.manager.findOne(Role_entity_1.Role, {
            where: { role_id: id },
            relations: {
                permissions: true,
                parentRole: { permissions: true },
            },
        });
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager
            .createQueryBuilder(Role_entity_1.Role, 'role')
            .leftJoinAndSelect('role.permissions', 'permissions')
            .leftJoinAndSelect('role.users', 'users')
            .leftJoinAndSelect('role.baseRole', 'baseRole')
            .leftJoinAndSelect('role.parentRole', 'parentRole')
            .getMany();
    }
    async deleteRole(roleId) {
        await data_source_1.AppDataSource.manager.delete(Role_entity_1.Role, { role_id: roleId });
    }
};
exports.RoleRepository = RoleRepository;
exports.RoleRepository = RoleRepository = __decorate([
    (0, inversify_1.injectable)()
], RoleRepository);
//# sourceMappingURL=role.repository.js.map