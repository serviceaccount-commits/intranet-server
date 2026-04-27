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
exports.UserDetails = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
let UserDetails = class UserDetails extends typeorm_1.BaseEntity {
    user_details_id;
    personal_email;
    personal_phone;
    residential_country;
    country_nationality;
    emergency_contact_name;
    emergency_contact_phone;
    re_hirable;
    hire_date;
    user;
};
exports.UserDetails = UserDetails;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserDetails.prototype, "user_details_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UserDetails.prototype, "personal_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UserDetails.prototype, "personal_phone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserDetails.prototype, "residential_country", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserDetails.prototype, "country_nationality", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserDetails.prototype, "emergency_contact_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UserDetails.prototype, "emergency_contact_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], UserDetails.prototype, "re_hirable", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamptz'),
    __metadata("design:type", Date)
], UserDetails.prototype, "hire_date", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_entity_1.User, (user) => user.userDetails),
    __metadata("design:type", User_entity_1.User)
], UserDetails.prototype, "user", void 0);
exports.UserDetails = UserDetails = __decorate([
    (0, typeorm_1.Entity)('user_details')
], UserDetails);
//# sourceMappingURL=UserDetails.entity.js.map