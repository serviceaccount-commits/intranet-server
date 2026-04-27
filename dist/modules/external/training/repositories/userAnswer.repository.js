"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAnswerRepository = void 0;
const inversify_1 = require("inversify");
const UserAnswers_entity_1 = require("../entities/UserAnswers.entity");
const data_source_1 = require("../../../../shared/database/data-source");
let UserAnswerRepository = class UserAnswerRepository {
    async create(userAnswer) {
        return await data_source_1.AppDataSource.manager.save(userAnswer);
    }
    async findByAttemptId(attemptId) {
        return await data_source_1.AppDataSource.manager.find(UserAnswers_entity_1.UserAnswer, {
            where: {
                attempt_id: attemptId,
            },
            relations: {
                question: true,
                option: true,
            },
        });
    }
};
exports.UserAnswerRepository = UserAnswerRepository;
exports.UserAnswerRepository = UserAnswerRepository = __decorate([
    (0, inversify_1.injectable)()
], UserAnswerRepository);
//# sourceMappingURL=userAnswer.repository.js.map