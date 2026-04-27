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
exports.Announcement = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const Document_entity_1 = require("../../../internal/documents/entities/Document.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const AnnouncementAcknowledgement_entity_1 = require("./AnnouncementAcknowledgement.entity");
const AnnouncementUsers_entity_1 = require("./AnnouncementUsers.entity");
const AnnouncementRead_entity_1 = require("./AnnouncementRead.entity");
let Announcement = class Announcement extends typeorm_1.BaseEntity {
    announcement_id;
    priority_level;
    type;
    announcement_state;
    created_at;
    updated_at;
    title;
    preview;
    open_acknowledge_until;
    user;
    user_id;
    document;
    document_id;
    acknowledgements;
    read;
    assigned_to_users;
    announcement_edit_available;
    addId() {
        this.announcement_id = (0, uuid_1.v4)();
    }
};
exports.Announcement = Announcement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Announcement.prototype, "announcement_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.HIGH, ES_1.default.MEDIUM, ES_1.default.LOW],
        default: ES_1.default.LOW,
    }),
    __metadata("design:type", String)
], Announcement.prototype, "priority_level", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.REGULAR, ES_1.default.PERSISTENT],
        default: ES_1.default.REGULAR,
    }),
    __metadata("design:type", String)
], Announcement.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.OPENED, ES_1.default.CLOSED],
        default: ES_1.default.OPENED,
    }),
    __metadata("design:type", String)
], Announcement.prototype, "announcement_state", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Announcement.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Announcement.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        default: 'Default Title',
        nullable: false,
    }),
    __metadata("design:type", String)
], Announcement.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], Announcement.prototype, "preview", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    }),
    __metadata("design:type", Date)
], Announcement.prototype, "open_acknowledge_until", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.announcements),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], Announcement.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Announcement.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Document_entity_1.Document),
    (0, typeorm_1.JoinColumn)({ name: 'document_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Document_entity_1.Document)
], Announcement.prototype, "document", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Announcement.prototype, "document_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AnnouncementAcknowledgement_entity_1.AnnouncementAcknowledgement, (ack) => ack.announcement),
    __metadata("design:type", Array)
], Announcement.prototype, "acknowledgements", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AnnouncementRead_entity_1.AnnouncementRead, (ack) => ack.announcement),
    __metadata("design:type", Array)
], Announcement.prototype, "read", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AnnouncementUsers_entity_1.AnnouncementAssignedToUser, (assign) => assign.announcement),
    __metadata("design:type", Array)
], Announcement.prototype, "assigned_to_users", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Announcement.prototype, "announcement_edit_available", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Announcement.prototype, "addId", null);
exports.Announcement = Announcement = __decorate([
    (0, typeorm_1.Entity)('announcements')
], Announcement);
//# sourceMappingURL=Announcement.entity.js.map