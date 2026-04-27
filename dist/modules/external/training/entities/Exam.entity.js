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
exports.Exam = void 0;
const typeorm_1 = require("typeorm");
const Class_entity_1 = require("./Class.entity");
const uuid_1 = require("uuid");
const Question_entity_1 = require("./Question.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const StandaloneExam_entity_1 = require("./StandaloneExam.entity");
let Exam = class Exam extends typeorm_1.BaseEntity {
    exam_id;
    class;
    class_id;
    standalone_exam;
    standalone_exam_id;
    questions;
    exam_type;
    exam_title;
    passing_score;
    version;
    exam_status;
    max_attempts;
    created_at;
    updated_at;
    addId() {
        this.exam_id = (0, uuid_1.v4)();
    }
};
exports.Exam = Exam;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Exam.prototype, "exam_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Class_entity_1.Class),
    (0, typeorm_1.JoinColumn)({ name: 'class_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Class_entity_1.Class)
], Exam.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Exam.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => StandaloneExam_entity_1.StandaloneExam),
    (0, typeorm_1.JoinColumn)({ name: 'standalone_exam_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", StandaloneExam_entity_1.StandaloneExam)
], Exam.prototype, "standalone_exam", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Exam.prototype, "standalone_exam_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Question_entity_1.Question, (question) => question.exam),
    __metadata("design:type", Array)
], Exam.prototype, "questions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.CLASS_EXAM, ES_1.default.STANDALONE_EXAM],
        default: ES_1.default.CLASS_EXAM,
    }),
    __metadata("design:type", String)
], Exam.prototype, "exam_type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Exam.prototype, "exam_title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Exam.prototype, "passing_score", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Exam.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.PUBLISHED, ES_1.default.DRAFT, ES_1.default.OUTDATED],
        default: ES_1.default.DRAFT,
    }),
    __metadata("design:type", String)
], Exam.prototype, "exam_status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Exam.prototype, "max_attempts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Exam.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Exam.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Exam.prototype, "addId", null);
exports.Exam = Exam = __decorate([
    (0, typeorm_1.Entity)('exams')
], Exam);
//# sourceMappingURL=Exam.entity.js.map