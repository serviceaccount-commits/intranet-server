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
exports.UserCustomFieldValue = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const User_entity_1 = require("./User.entity");
const CustomField_entity_1 = require("./CustomField.entity");
let UserCustomFieldValue = class UserCustomFieldValue extends typeorm_1.BaseEntity {
    value_id;
    value;
    user_id;
    user;
    field_id;
    field;
    created_at;
    updated_at;
    addId() {
        this.value_id = (0, uuid_1.v4)();
    }
};
exports.UserCustomFieldValue = UserCustomFieldValue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserCustomFieldValue.prototype, "value_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserCustomFieldValue.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], UserCustomFieldValue.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.customFieldValues, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_entity_1.User)
], UserCustomFieldValue.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], UserCustomFieldValue.prototype, "field_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CustomField_entity_1.CustomField, (customField) => customField.userValues, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'field_id' }),
    __metadata("design:type", CustomField_entity_1.CustomField)
], UserCustomFieldValue.prototype, "field", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserCustomFieldValue.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserCustomFieldValue.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserCustomFieldValue.prototype, "addId", null);
exports.UserCustomFieldValue = UserCustomFieldValue = __decorate([
    (0, typeorm_1.Entity)('user_custom_field_values'),
    (0, typeorm_1.Index)('idx_user_field', ['user_id', 'field_id'])
], UserCustomFieldValue);
//# sourceMappingURL=UserCustomFieldValue.entity.js.map