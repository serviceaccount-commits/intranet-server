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
exports.RoleService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const Role_entity_1 = require("../entities/Role.entity");
const data_source_1 = require("../../../../shared/database/data-source");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const ActionNotAllowedError_1 = require("../../../../shared/errors/ActionNotAllowedError");
let RoleService = class RoleService {
    roleRepository;
    permissionRespository;
    constructor(roleRepository, permissionRespository) {
        this.roleRepository = roleRepository;
        this.permissionRespository = permissionRespository;
    }
    async createRole(roleName, roleStatus, permissionIds) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const permissions = await Promise.all(permissionIds.map(async (id) => this.permissionRespository.findById(id)));
            if (permissions.some((p) => !p)) {
                throw new Error('One or more permission IDs are invalid.');
            }
            const newRole = new Role_entity_1.Role();
            newRole.role_name = roleName;
            newRole.role_status = roleStatus;
            const role = await this.roleRepository.create(newRole, permissions);
            return role;
        });
    }
    async getRoles() {
        return await this.roleRepository.findAll();
    }
    async getRoleById(roleId) {
        const role = await this.roleRepository.findById(roleId);
        if (!role) {
            throw new NotFoundError_1.NotFoundError(`Role`, roleId);
        }
        return role;
    }
    /**
     * A derived role may never hold more than the role it was derived from, and
     * a base role is fixed.
     *
     * The Roles screen already greys out the boxes above that ceiling, but a
     * checkbox attribute is a hint, not a rule: a request made by hand went
     * straight through and could hand a role the whole catalog. This is the same
     * rule where it actually holds.
     */
    async updateRolePermissions(roleId, permissionIds) {
        if (!Array.isArray(permissionIds)) {
            throw new BusinessLogicError_1.BusinessLogicError('permissionIds must be an array.');
        }
        await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const role = await this.roleRepository.findByIdWithParent(roleId);
            if (!role) {
                throw new NotFoundError_1.NotFoundError(`Role`, roleId);
            }
            if (role.is_base_role) {
                throw new ActionNotAllowedError_1.ActionNotAllowedError('The permissions of a base role cannot be changed.');
            }
            if (!role.parentRole) {
                throw new ActionNotAllowedError_1.ActionNotAllowedError('This role is not derived from another role, so its permissions cannot be edited.');
            }
            const requestedIds = [...new Set(permissionIds)];
            const ceiling = new Set((role.parentRole.permissions || []).map((p) => p.permission_id));
            const outsideCeiling = requestedIds.filter((id) => !ceiling.has(id));
            if (outsideCeiling.length > 0) {
                throw new ActionNotAllowedError_1.ActionNotAllowedError(`Cannot grant permissions that the parent role does not have: ${outsideCeiling.join(', ')}`);
            }
            const allPermissions = await this.permissionRespository.findAllByIds(requestedIds);
            if (allPermissions.length !== requestedIds.length) {
                const foundPermissionIds = allPermissions.map((p) => p.permission_id);
                const notFoundPermissionIds = requestedIds.filter((id) => !foundPermissionIds.includes(id));
                throw new NotFoundError_1.NotFoundError(`Permissions not found: ${notFoundPermissionIds.join(', ')}`);
            }
            role.permissions = allPermissions;
            await this.roleRepository.save(role);
        });
    }
    async createRoleBased(roleId, input) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const role = await this.roleRepository.findById(roleId);
            if (!role) {
                throw new NotFoundError_1.NotFoundError(`Role`, roleId);
            }
            const newRole = new Role_entity_1.Role();
            newRole.role_name = input.roleName;
            newRole.description = input.roleDescription;
            newRole.permissions = role.permissions;
            newRole.parent_role_id = roleId;
            if (role.is_base_role) {
                newRole.base_role_id = roleId;
            }
            else {
                newRole.base_role_id = role.base_role_id;
            }
            return await this.roleRepository.create(newRole, role.permissions);
        });
    }
    async deleteRole(roleId) {
        const role = await this.roleRepository.findById(roleId);
        if (!role) {
            throw new NotFoundError_1.NotFoundError(`Role`, roleId);
        }
        if (role.users.length > 0) {
            throw new BusinessLogicError_1.BusinessLogicError(`Role ${roleId} has users assigned to it.`);
        }
        if (role.is_base_role) {
            throw new BusinessLogicError_1.BusinessLogicError(`Role ${roleId} is a base role.`);
        }
        await this.roleRepository.deleteRole(roleId);
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IRoleRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IPermissionRepository)),
    __metadata("design:paramtypes", [Object, Object])
], RoleService);
//# sourceMappingURL=role.service.js.map