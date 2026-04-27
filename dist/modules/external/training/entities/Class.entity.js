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
exports.Class = void 0;
const typeorm_1 = require("typeorm");
const TrainingTopic_entity_1 = require("./TrainingTopic.entity");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const Comment_entity_1 = require("./Comment.entity");
const uuid_1 = require("uuid");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const Document_entity_1 = require("../../../internal/documents/entities/Document.entity");
const Exam_entity_1 = require("./Exam.entity");
let Class = class Class extends typeorm_1.BaseEntity {
    class_id;
    class_name;
    class_description;
    private_comments;
    class_status;
    user;
    user_id;
    topic;
    topic_id;
    comments;
    document;
    document_id;
    exams;
    addId() {
        this.class_id = (0, uuid_1.v4)();
    }
};
exports.Class = Class;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Class.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Class.prototype, "class_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Class.prototype, "class_description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Class.prototype, "private_comments", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.PUBLISHED, ES_1.default.DRAFT, ES_1.default.ARCHIVED],
        default: ES_1.default.DRAFT,
    }),
    __metadata("design:type", String)
], Class.prototype, "class_status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], Class.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Class.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TrainingTopic_entity_1.TrainingTopic),
    (0, typeorm_1.JoinColumn)({ name: 'topic_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", TrainingTopic_entity_1.TrainingTopic)
], Class.prototype, "topic", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Class.prototype, "topic_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comment_entity_1.Comment, (commentEntity) => commentEntity.class),
    __metadata("design:type", Array)
], Class.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Document_entity_1.Document),
    (0, typeorm_1.JoinColumn)({ name: 'document_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Document_entity_1.Document)
], Class.prototype, "document", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Class.prototype, "document_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Exam_entity_1.Exam, (exam) => exam.class),
    __metadata("design:type", Array)
], Class.prototype, "exams", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Class.prototype, "addId", null);
exports.Class = Class = __decorate([
    (0, typeorm_1.Entity)('classes')
], Class);
//# sourceMappingURL=Class.entity.js.map