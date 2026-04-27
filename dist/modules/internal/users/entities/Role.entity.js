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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Permission_entity_1 = require("./Permission.entity");
const User_entity_1 = require("./User.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let Role = class Role extends typeorm_1.BaseEntity {
    role_id;
    role_name;
    description;
    role_status;
    permissions;
    baseRole;
    base_role_id;
    parentRole;
    parent_role_id;
    is_base_role;
    users;
    addId() {
        this.role_id = (0, uuid_1.v4)();
    }
};
exports.Role = Role;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Role.prototype, "role_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Role.prototype, "role_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Role.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.ACTIVE, ES_1.default.INACTIVE],
        default: ES_1.default.ACTIVE,
    }),
    __metadata("design:type", String)
], Role.prototype, "role_status", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Permission_entity_1.Permission, { eager: false }),
    (0, typeorm_1.JoinTable)({
        name: 'role_permissions', // The name of the join table
        joinColumn: {
            name: 'role_id',
            referencedColumnName: 'role_id',
        },
        inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'permission_id',
        },
    }),
    __metadata("design:type", Array)
], Role.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Role, (role) => role.baseRole),
    (0, typeorm_1.JoinColumn)({ name: 'base_role_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Role)
], Role.prototype, "baseRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Role.prototype, "base_role_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Role, (role) => role.baseRole),
    (0, typeorm_1.JoinColumn)({ name: 'parent_role_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Role)
], Role.prototype, "parentRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Role.prototype, "parent_role_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Role.prototype, "is_base_role", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User_entity_1.User, (user) => user.role),
    __metadata("design:type", Array)
], Role.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Role.prototype, "addId", null);
exports.Role = Role = __decorate([
    (0, typeorm_1.Entity)('roles')
], Role);
//# sourceMappingURL=Role.entity.js.map