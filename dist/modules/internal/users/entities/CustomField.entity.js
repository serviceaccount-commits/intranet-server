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
exports.CustomField = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const UserCustomFieldValue_entity_1 = require("./UserCustomFieldValue.entity");
let CustomField = class CustomField extends typeorm_1.BaseEntity {
    field_id;
    field_name;
    data_type;
    visibility;
    status;
    userValues;
    created_at;
    updated_at;
    addId() {
        this.field_id = (0, uuid_1.v4)();
    }
};
exports.CustomField = CustomField;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomField.prototype, "field_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], CustomField.prototype, "field_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.STRING, ES_1.default.BOOLEAN, ES_1.default.DATE],
        default: ES_1.default.STRING,
    }),
    __metadata("design:type", String)
], CustomField.prototype, "data_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.PUBLIC, ES_1.default.PRIVATE],
        default: ES_1.default.PRIVATE,
    }),
    __metadata("design:type", String)
], CustomField.prototype, "visibility", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.ACTIVE, ES_1.default.INACTIVE],
        default: ES_1.default.INACTIVE,
    }),
    __metadata("design:type", String)
], CustomField.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserCustomFieldValue_entity_1.UserCustomFieldValue, (customFieldValue) => customFieldValue.field),
    __metadata("design:type", Array)
], CustomField.prototype, "userValues", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CustomField.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CustomField.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomField.prototype, "addId", null);
exports.CustomField = CustomField = __decorate([
    (0, typeorm_1.Entity)('custom_fields')
], CustomField);
//# sourceMappingURL=CustomField.entity.js.map