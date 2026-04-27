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
exports.TrainingTopicUserValue = void 0;
const typeorm_1 = require("typeorm");
const TrainingTopic_entity_1 = require("./TrainingTopic.entity");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const CourseUserValue_entity_1 = require("./CourseUserValue.entity");
const ClassUserValue_entity_1 = require("./ClassUserValue.entity");
let TrainingTopicUserValue = class TrainingTopicUserValue extends typeorm_1.BaseEntity {
    topic_value_id;
    completed_classes_count;
    total_classes_count;
    user;
    user_id;
    courseValue;
    course_value_id;
    topic;
    topic_id;
    classValues;
};
exports.TrainingTopicUserValue = TrainingTopicUserValue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TrainingTopicUserValue.prototype, "topic_value_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], TrainingTopicUserValue.prototype, "completed_classes_count", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], TrainingTopicUserValue.prototype, "total_classes_count", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], TrainingTopicUserValue.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TrainingTopicUserValue.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CourseUserValue_entity_1.CourseUserValue),
    (0, typeorm_1.JoinColumn)({ name: 'course_value_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", CourseUserValue_entity_1.CourseUserValue)
], TrainingTopicUserValue.prototype, "courseValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TrainingTopicUserValue.prototype, "course_value_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TrainingTopic_entity_1.TrainingTopic),
    (0, typeorm_1.JoinColumn)({ name: 'topic_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", TrainingTopic_entity_1.TrainingTopic)
], TrainingTopicUserValue.prototype, "topic", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TrainingTopicUserValue.prototype, "topic_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ClassUserValue_entity_1.ClassUserValue, (classValue) => classValue.topicValue),
    __metadata("design:type", Array)
], TrainingTopicUserValue.prototype, "classValues", void 0);
exports.TrainingTopicUserValue = TrainingTopicUserValue = __decorate([
    (0, typeorm_1.Entity)('training_topic_user_values')
], TrainingTopicUserValue);
//# sourceMappingURL=TrainingTopicUserValue.entity.js.map