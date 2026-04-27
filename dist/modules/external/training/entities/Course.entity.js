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
exports.Course = void 0;
const typeorm_1 = require("typeorm");
const TrainingTopic_entity_1 = require("./TrainingTopic.entity");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const uuid_1 = require("uuid");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const CourseUserValue_entity_1 = require("./CourseUserValue.entity");
let Course = class Course extends typeorm_1.BaseEntity {
    course_id;
    course_name;
    course_description;
    course_status;
    updated_at;
    user;
    user_id;
    topics;
    userValues;
    addId() {
        this.course_id = (0, uuid_1.v4)();
    }
};
exports.Course = Course;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Course.prototype, "course_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Course.prototype, "course_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Course.prototype, "course_description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.ACTIVE, ES_1.default.INACTIVE, ES_1.default.PUBLISHED, ES_1.default.DRAFT, ES_1.default.ARCHIVED],
        default: ES_1.default.ACTIVE,
    }),
    __metadata("design:type", String)
], Course.prototype, "course_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Course.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], Course.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TrainingTopic_entity_1.TrainingTopic, (topic) => topic.course),
    __metadata("design:type", Array)
], Course.prototype, "topics", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CourseUserValue_entity_1.CourseUserValue, (courseValue) => courseValue.course),
    __metadata("design:type", Array)
], Course.prototype, "userValues", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Course.prototype, "addId", null);
exports.Course = Course = __decorate([
    (0, typeorm_1.Entity)('courses')
], Course);
//# sourceMappingURL=Course.entity.js.map