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
exports.ClassUserValue = void 0;
const typeorm_1 = require("typeorm");
const Class_entity_1 = require("./Class.entity");
const User_entity_1 = require("../../../internal/users/entities/User.entity");
const TrainingTopicUserValue_entity_1 = require("./TrainingTopicUserValue.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let ClassUserValue = class ClassUserValue extends typeorm_1.BaseEntity {
    class_value_id;
    completion_status;
    user;
    user_id;
    topicValue;
    topic_value_id;
    class;
    class_id;
};
exports.ClassUserValue = ClassUserValue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClassUserValue.prototype, "class_value_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [ES_1.default.COMPLETED, ES_1.default.INCOMPLETE],
        default: ES_1.default.INCOMPLETE,
    }),
    __metadata("design:type", String)
], ClassUserValue.prototype, "completion_status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_entity_1.User)
], ClassUserValue.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ClassUserValue.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TrainingTopicUserValue_entity_1.TrainingTopicUserValue),
    (0, typeorm_1.JoinColumn)({ name: 'topic_value_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", TrainingTopicUserValue_entity_1.TrainingTopicUserValue)
], ClassUserValue.prototype, "topicValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ClassUserValue.prototype, "topic_value_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Class_entity_1.Class),
    (0, typeorm_1.JoinColumn)({ name: 'class_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Class_entity_1.Class)
], ClassUserValue.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ClassUserValue.prototype, "class_id", void 0);
exports.ClassUserValue = ClassUserValue = __decorate([
    (0, typeorm_1.Entity)('class_user_values')
], ClassUserValue);
//# sourceMappingURL=ClassUserValue.entity.js.map