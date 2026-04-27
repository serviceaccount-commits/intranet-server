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
exports.UserReportsTo = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
let UserReportsTo = class UserReportsTo extends typeorm_1.BaseEntity {
    reporting_user_id;
    reportingUser; // The user who reports to someone
    reports_to_user_id;
    reportsToUser; // The user *being reported to* (the manager/supervisor)
};
exports.UserReportsTo = UserReportsTo;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], UserReportsTo.prototype, "reporting_user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.reportingTo, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'reporting_user_id' }),
    __metadata("design:type", User_entity_1.User)
], UserReportsTo.prototype, "reportingUser", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], UserReportsTo.prototype, "reports_to_user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.reportsTo, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'reports_to_user_id' }),
    __metadata("design:type", User_entity_1.User)
], UserReportsTo.prototype, "reportsToUser", void 0);
exports.UserReportsTo = UserReportsTo = __decorate([
    (0, typeorm_1.Entity)('user_reports_to')
], UserReportsTo);
//# sourceMappingURL=UserReportsTo.entity.js.map