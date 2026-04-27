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
exports.Client = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const Topic_entity_1 = require("./Topic.entity");
const REGION_1 = __importDefault(require("../../../../shared/types/enum/REGION"));
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let Client = class Client extends typeorm_1.BaseEntity {
    client_id;
    client_shared_id;
    region;
    client_name;
    client_edit_available;
    user;
    user_id;
    topics;
    createdAt;
    updatedAt;
    users;
    is_im = false;
    is_flx = false;
    entity;
    address;
    primary_contact_name;
    primary_contact_email;
    primary_contact_phone;
    addId() {
        this.client_id = (0, uuid_1.v4)();
    }
};
exports.Client = Client;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Client.prototype, "client_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "client_shared_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [REGION_1.default.US, REGION_1.default.CO],
        default: 'us',
    }),
    __metadata("design:type", String)
], Client.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Client.prototype, "client_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Client.prototype, "client_edit_available", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], Client.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Topic_entity_1.Topic, (topic) => topic.client),
    __metadata("design:type", Array)
], Client.prototype, "topics", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Client.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Client.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User_entity_1.User, (user) => user.clients),
    __metadata("design:type", Array)
], Client.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Client.prototype, "is_im", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Client.prototype, "is_flx", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.PARICUS_LLC, ES_1.default.PARICUS_COLOMBIA],
        default: ES_1.default.PARICUS_LLC,
    }),
    __metadata("design:type", String)
], Client.prototype, "entity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, unique: true }),
    __metadata("design:type", String)
], Client.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "primary_contact_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, unique: true }),
    __metadata("design:type", String)
], Client.prototype, "primary_contact_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, unique: true }),
    __metadata("design:type", String)
], Client.prototype, "primary_contact_phone", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Client.prototype, "addId", null);
exports.Client = Client = __decorate([
    (0, typeorm_1.Entity)('clients')
], Client);
//# sourceMappingURL=Client.entity.js.map