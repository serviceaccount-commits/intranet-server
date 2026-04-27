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
exports.AnnouncementAcknowledgement = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const Announcement_entity_1 = require("./Announcement.entity");
let AnnouncementAcknowledgement = class AnnouncementAcknowledgement extends typeorm_1.BaseEntity {
    user_id;
    user;
    announcement_id;
    announcement;
    acknowledgement_in_time;
    created_at; // Timestamp of acknowledgement
};
exports.AnnouncementAcknowledgement = AnnouncementAcknowledgement;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], AnnouncementAcknowledgement.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.acknowledgements, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], AnnouncementAcknowledgement.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], AnnouncementAcknowledgement.prototype, "announcement_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Announcement_entity_1.Announcement, (announcement) => announcement.acknowledgements, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'announcement_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Announcement_entity_1.Announcement)
], AnnouncementAcknowledgement.prototype, "announcement", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], AnnouncementAcknowledgement.prototype, "acknowledgement_in_time", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AnnouncementAcknowledgement.prototype, "created_at", void 0);
exports.AnnouncementAcknowledgement = AnnouncementAcknowledgement = __decorate([
    (0, typeorm_1.Entity)('announcement_acknowledgements') // Correct table name
], AnnouncementAcknowledgement);
//# sourceMappingURL=AnnouncementAcknowledgement.entity.js.map