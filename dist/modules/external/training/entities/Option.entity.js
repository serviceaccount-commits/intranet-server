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
exports.Option = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Question_entity_1 = require("./Question.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let Option = class Option extends typeorm_1.BaseEntity {
    option_id;
    question;
    question_id;
    option_text;
    is_correct;
    created_at;
    status;
    addId() {
        this.option_id = (0, uuid_1.v4)();
    }
};
exports.Option = Option;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Option.prototype, "option_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Question_entity_1.Question, (question) => question.options, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'question_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Question_entity_1.Question)
], Option.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Option.prototype, "question_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Option.prototype, "option_text", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Option.prototype, "is_correct", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Option.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.ACTIVE, ES_1.default.INACTIVE],
        default: ES_1.default.ACTIVE,
    }),
    __metadata("design:type", String)
], Option.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Option.prototype, "addId", null);
exports.Option = Option = __decorate([
    (0, typeorm_1.Entity)('options')
], Option);
//# sourceMappingURL=Option.entity.js.map