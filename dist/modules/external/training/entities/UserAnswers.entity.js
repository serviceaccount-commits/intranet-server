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
exports.UserAnswer = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const UserExamAttempts_entity_1 = require("./UserExamAttempts.entity");
const Question_entity_1 = require("./Question.entity");
const Option_entity_1 = require("./Option.entity");
let UserAnswer = class UserAnswer extends typeorm_1.BaseEntity {
    user_answer_id;
    attempt;
    attempt_id;
    question;
    question_id;
    option;
    option_id;
    created_at;
    updated_at;
    addId() {
        this.user_answer_id = (0, uuid_1.v4)();
    }
};
exports.UserAnswer = UserAnswer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserAnswer.prototype, "user_answer_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UserExamAttempts_entity_1.UserExamAttempt),
    (0, typeorm_1.JoinColumn)({ name: 'attempt_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", UserExamAttempts_entity_1.UserExamAttempt)
], UserAnswer.prototype, "attempt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserAnswer.prototype, "attempt_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Question_entity_1.Question),
    (0, typeorm_1.JoinColumn)({ name: 'question_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Question_entity_1.Question)
], UserAnswer.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserAnswer.prototype, "question_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Option_entity_1.Option),
    (0, typeorm_1.JoinColumn)({ name: 'option_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Option_entity_1.Option)
], UserAnswer.prototype, "option", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserAnswer.prototype, "option_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserAnswer.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserAnswer.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserAnswer.prototype, "addId", null);
exports.UserAnswer = UserAnswer = __decorate([
    (0, typeorm_1.Entity)('user_answers')
], UserAnswer);
//# sourceMappingURL=UserAnswers.entity.js.map