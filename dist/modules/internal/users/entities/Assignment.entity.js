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
exports.Assignment = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const User_entity_1 = require("./User.entity");
let Assignment = class Assignment extends typeorm_1.BaseEntity {
    assignment_id;
    assignment_name;
    users;
    addId() {
        this.assignment_id = (0, uuid_1.v4)();
    }
};
exports.Assignment = Assignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Assignment.prototype, "assignment_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Assignment.prototype, "assignment_name", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User_entity_1.User, (user) => user.assignments),
    __metadata("design:type", Array)
], Assignment.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Assignment.prototype, "addId", null);
exports.Assignment = Assignment = __decorate([
    (0, typeorm_1.Entity)('assignments')
], Assignment);
//# sourceMappingURL=Assignment.entity.js.map