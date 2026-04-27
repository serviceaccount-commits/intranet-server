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
exports.UserExamAttempt = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Exam_entity_1 = require("./Exam.entity");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let UserExamAttempt = class UserExamAttempt extends typeorm_1.BaseEntity {
    attempt_id;
    exam;
    exam_id;
    user;
    user_id;
    attempt_date;
    score;
    status;
    isValid;
    addId() {
        this.attempt_id = (0, uuid_1.v4)();
    }
};
exports.UserExamAttempt = UserExamAttempt;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserExamAttempt.prototype, "attempt_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exam_entity_1.Exam),
    (0, typeorm_1.JoinColumn)({ name: 'exam_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Exam_entity_1.Exam)
], UserExamAttempt.prototype, "exam", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserExamAttempt.prototype, "exam_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], UserExamAttempt.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserExamAttempt.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    }),
    __metadata("design:type", Date)
], UserExamAttempt.prototype, "attempt_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], UserExamAttempt.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.PASSED, ES_1.default.FAILED],
    }),
    __metadata("design:type", String)
], UserExamAttempt.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UserExamAttempt.prototype, "isValid", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserExamAttempt.prototype, "addId", null);
exports.UserExamAttempt = UserExamAttempt = __decorate([
    (0, typeorm_1.Entity)('user_exam_attempts')
], UserExamAttempt);
//# sourceMappingURL=UserExamAttempts.entity.js.map