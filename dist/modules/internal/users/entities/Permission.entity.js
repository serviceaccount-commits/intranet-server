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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = void 0;
const typeorm_1 = require("typeorm");
let Permission = class Permission extends typeorm_1.BaseEntity {
    permission_id;
    app_module;
};
exports.Permission = Permission;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Permission.prototype, "permission_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [
            'knowledge-base',
            'staff-directory',
            'announcements',
            'training',
            'profile',
            'admin',
        ],
        default: 'knowledge-base',
    }),
    __metadata("design:type", String)
], Permission.prototype, "app_module", void 0);
exports.Permission = Permission = __decorate([
    (0, typeorm_1.Entity)('permissions')
], Permission);
//# sourceMappingURL=Permission.entity.js.map