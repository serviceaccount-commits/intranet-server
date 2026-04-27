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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const Client_entity_1 = require("../../../external/knowledgeBase/entities/Client.entity");
const Role_entity_1 = require("./Role.entity");
const Assignment_entity_1 = require("./Assignment.entity");
const UserReportsTo_entity_1 = require("./UserReportsTo.entity");
const Announcement_entity_1 = require("../../../external/announcements/entity/Announcement.entity");
const AnnouncementAcknowledgement_entity_1 = require("../../../external/announcements/entity/AnnouncementAcknowledgement.entity");
const UserCustomFieldValue_entity_1 = require("./UserCustomFieldValue.entity");
const AnnouncementUsers_entity_1 = require("../../../external/announcements/entity/AnnouncementUsers.entity");
const AnnouncementRead_entity_1 = require("../../../external/announcements/entity/AnnouncementRead.entity");
const UserDetail_entity_1 = require("./UserDetail.entity");
let User = class User extends typeorm_1.BaseEntity {
    user_id;
    // TODO: change to just having full_name so that the search is better, but I have to delete all users and data for this change to be properly done
    first_name;
    last_name;
    work_email;
    work_phone;
    selectable_as_leader;
    job_title;
    reportingTo;
    userDetails;
    user_details_id;
    status;
    user_edit_available;
    role;
    role_id;
    clients;
    assignments;
    announcements;
    assignedAnnouncements;
    acknowledgements;
    read;
    reportsTo; // Users who report *to* this user
    customFieldValues;
    email_verified;
    last_activity_at;
    createdAt;
    updatedAt;
    addId() {
        this.user_id = (0, uuid_1.v4)();
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], User.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], User.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], User.prototype, "work_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "work_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], User.prototype, "selectable_as_leader", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "job_title", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => UserReportsTo_entity_1.UserReportsTo, (UserReportsTo) => UserReportsTo.reportingUser),
    __metadata("design:type", UserReportsTo_entity_1.UserReportsTo)
], User.prototype, "reportingTo", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => UserDetail_entity_1.UserDetails, 'user'),
    (0, typeorm_1.JoinColumn)({ name: 'user_details_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", UserDetail_entity_1.UserDetails)
], User.prototype, "userDetails", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], User.prototype, "user_details_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.ACTIVE, ES_1.default.INACTIVE],
        default: ES_1.default.ACTIVE,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "user_edit_available", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Role_entity_1.Role, (role) => role.users),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Role_entity_1.Role)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "role_id", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Client_entity_1.Client, (client) => client.users),
    (0, typeorm_1.JoinTable)({
        name: 'user_clients', // The name of the join table
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'user_id',
        },
        inverseJoinColumn: {
            name: 'client_id',
            referencedColumnName: 'client_id',
        },
    }),
    __metadata("design:type", Array)
], User.prototype, "clients", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Assignment_entity_1.Assignment, (assignment) => assignment.users),
    (0, typeorm_1.JoinTable)({
        name: 'user_assignments', // The name of the join table
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'user_id',
        },
        inverseJoinColumn: {
            name: 'assignment_id',
            referencedColumnName: 'assignment_id',
        },
    }),
    __metadata("design:type", Array)
], User.prototype, "assignments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Announcement_entity_1.Announcement, (announcement) => announcement.user),
    __metadata("design:type", Array)
], User.prototype, "announcements", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AnnouncementUsers_entity_1.AnnouncementAssignedToUser, (AnnouncementAssignedToUser) => AnnouncementAssignedToUser.user),
    __metadata("design:type", Array)
], User.prototype, "assignedAnnouncements", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AnnouncementAcknowledgement_entity_1.AnnouncementAcknowledgement, (ack) => ack.user),
    __metadata("design:type", Array)
], User.prototype, "acknowledgements", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AnnouncementRead_entity_1.AnnouncementRead, (ack) => ack.user),
    __metadata("design:type", Array)
], User.prototype, "read", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserReportsTo_entity_1.UserReportsTo, (userReportsTo) => userReportsTo.reportsToUser),
    __metadata("design:type", Array)
], User.prototype, "reportsTo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserCustomFieldValue_entity_1.UserCustomFieldValue, (customFieldValue) => customFieldValue.user),
    __metadata("design:type", Array)
], User.prototype, "customFieldValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "email_verified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "last_activity_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], User.prototype, "addId", null);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=User.entity.js.map