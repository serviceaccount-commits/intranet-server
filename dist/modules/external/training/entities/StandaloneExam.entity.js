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
exports.StandaloneExam = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const uuid_1 = require("uuid");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const Exam_entity_1 = require("./Exam.entity");
let StandaloneExam = class StandaloneExam extends typeorm_1.BaseEntity {
    standalone_exam_id;
    standalone_exam_name;
    standalone_exam_status;
    awaiting_approval_at;
    approved_at;
    user;
    user_id;
    approved_by;
    approved_by_id;
    exam;
    exam_id;
    addId() {
        this.standalone_exam_id = (0, uuid_1.v4)();
    }
};
exports.StandaloneExam = StandaloneExam;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StandaloneExam.prototype, "standalone_exam_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StandaloneExam.prototype, "standalone_exam_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.AWAITING_APPROVAL, ES_1.default.APPROVED, ES_1.default.IN_PROGRESS],
        default: ES_1.default.IN_PROGRESS,
    }),
    __metadata("design:type", String)
], StandaloneExam.prototype, "standalone_exam_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], StandaloneExam.prototype, "awaiting_approval_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], StandaloneExam.prototype, "approved_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], StandaloneExam.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StandaloneExam.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], StandaloneExam.prototype, "approved_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StandaloneExam.prototype, "approved_by_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Exam_entity_1.Exam),
    (0, typeorm_1.JoinColumn)({ name: 'exam_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Exam_entity_1.Exam)
], StandaloneExam.prototype, "exam", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StandaloneExam.prototype, "exam_id", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StandaloneExam.prototype, "addId", null);
exports.StandaloneExam = StandaloneExam = __decorate([
    (0, typeorm_1.Entity)('standalone_exams')
], StandaloneExam);
//# sourceMappingURL=StandaloneExam.entity.js.map