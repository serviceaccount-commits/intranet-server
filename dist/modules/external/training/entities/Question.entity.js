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
exports.Question = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Exam_entity_1 = require("./Exam.entity");
const QuestionType_entity_1 = require("./QuestionType.entity");
const Option_entity_1 = require("./Option.entity");
let Question = class Question extends typeorm_1.BaseEntity {
    question_id;
    exam;
    exam_id;
    question_type;
    question_type_id;
    options;
    question_text;
    created_at;
    addId() {
        this.question_id = (0, uuid_1.v4)();
    }
};
exports.Question = Question;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Question.prototype, "question_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exam_entity_1.Exam, (exam) => exam.questions, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'exam_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Exam_entity_1.Exam)
], Question.prototype, "exam", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Question.prototype, "exam_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => QuestionType_entity_1.QuestionType),
    (0, typeorm_1.JoinColumn)({ name: 'question_type_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", QuestionType_entity_1.QuestionType)
], Question.prototype, "question_type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Question.prototype, "question_type_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Option_entity_1.Option, (option) => option.question),
    __metadata("design:type", Array)
], Question.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Question.prototype, "question_text", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Question.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Question.prototype, "addId", null);
exports.Question = Question = __decorate([
    (0, typeorm_1.Entity)('questions')
], Question);
//# sourceMappingURL=Question.entity.js.map