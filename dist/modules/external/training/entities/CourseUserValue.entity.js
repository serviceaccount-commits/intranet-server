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
exports.CourseUserValue = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const Course_entity_1 = require("./Course.entity");
const TrainingTopicUserValue_entity_1 = require("./TrainingTopicUserValue.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const uuid_1 = require("uuid");
let CourseUserValue = class CourseUserValue extends typeorm_1.BaseEntity {
    course_value_id;
    user_availability_status;
    user;
    user_id;
    course;
    course_id;
    topicValues;
    addId() {
        this.course_id = (0, uuid_1.v4)();
    }
};
exports.CourseUserValue = CourseUserValue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CourseUserValue.prototype, "course_value_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.ACTIVE, ES_1.default.INACTIVE],
        default: ES_1.default.ACTIVE,
    }),
    __metadata("design:type", String)
], CourseUserValue.prototype, "user_availability_status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], CourseUserValue.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CourseUserValue.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_entity_1.Course, (course) => course.userValues, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Course_entity_1.Course)
], CourseUserValue.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CourseUserValue.prototype, "course_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TrainingTopicUserValue_entity_1.TrainingTopicUserValue, (topicValue) => topicValue.courseValue),
    __metadata("design:type", Array)
], CourseUserValue.prototype, "topicValues", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CourseUserValue.prototype, "addId", null);
exports.CourseUserValue = CourseUserValue = __decorate([
    (0, typeorm_1.Entity)('course_user_values')
], CourseUserValue);
//# sourceMappingURL=CourseUserValue.entity.js.map