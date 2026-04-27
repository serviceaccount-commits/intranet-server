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
exports.TrainingTopic = void 0;
const typeorm_1 = require("typeorm");
const Course_entity_1 = require("./Course.entity");
const Class_entity_1 = require("./Class.entity");
const uuid_1 = require("uuid");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let TrainingTopic = class TrainingTopic extends typeorm_1.BaseEntity {
    topic_id;
    topic_name;
    topic_status;
    course;
    course_id;
    classes;
    addId() {
        this.topic_id = (0, uuid_1.v4)();
    }
};
exports.TrainingTopic = TrainingTopic;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TrainingTopic.prototype, "topic_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TrainingTopic.prototype, "topic_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.ACTIVE, ES_1.default.INACTIVE, ES_1.default.PUBLISHED, ES_1.default.DRAFT, ES_1.default.ARCHIVED],
        default: ES_1.default.ACTIVE,
    }),
    __metadata("design:type", String)
], TrainingTopic.prototype, "topic_status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_entity_1.Course),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Course_entity_1.Course)
], TrainingTopic.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TrainingTopic.prototype, "course_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Class_entity_1.Class, (classEntity) => classEntity.topic),
    __metadata("design:type", Array)
], TrainingTopic.prototype, "classes", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrainingTopic.prototype, "addId", null);
exports.TrainingTopic = TrainingTopic = __decorate([
    (0, typeorm_1.Entity)('training_topics')
], TrainingTopic);
//# sourceMappingURL=TrainingTopic.entity.js.map