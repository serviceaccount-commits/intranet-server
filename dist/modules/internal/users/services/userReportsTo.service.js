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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserReportsToService = void 0;
const inversify_1 = require("inversify");
const UserReportsTo_entity_1 = require("../entities/UserReportsTo.entity");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const ConflictError_1 = require("../../../../shared/errors/ConflictError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let UserReportsToService = class UserReportsToService {
    userReportsToRepository;
    userRepository;
    constructor(userReportsToRepository, userRepository) {
        this.userReportsToRepository = userReportsToRepository;
        this.userRepository = userRepository;
    }
    async createUserReportsTo(reportingUserId, reportsToUserId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const reportingUser = await this.userRepository.findUserById(reportingUserId);
            const reportsToUser = await this.userRepository.findUserById(reportsToUserId);
            if (!reportingUser) {
                throw new NotFoundError_1.NotFoundError('User', reportingUserId);
            }
            if (!reportsToUser) {
                throw new NotFoundError_1.NotFoundError('User', reportsToUserId);
            }
            if (!reportsToUser.selectable_as_leader) {
                throw new BusinessLogicError_1.BusinessLogicError(`User ${reportsToUserId} is not selectable as a leader.`);
            }
            const existingRelationship = await this.userReportsToRepository.findUserReportsToRelationship(reportingUserId, reportsToUserId);
            if (existingRelationship) {
                throw new ConflictError_1.ConflictError(`User ${reportingUserId} already reports to user ${reportsToUserId}.`);
            }
            if (reportingUser.user_id === reportsToUserId) {
                throw new BusinessLogicError_1.BusinessLogicError(`User ${reportingUserId} cannot report to themselves.`);
            }
            const userReportsTo = new UserReportsTo_entity_1.UserReportsTo();
            userReportsTo.reportingUser = reportingUser;
            userReportsTo.reporting_user_id = reportingUserId;
            userReportsTo.reportsToUser = reportsToUser;
            userReportsTo.reports_to_user_id = reportsToUserId;
            return await this.userReportsToRepository.create(userReportsTo);
        });
    }
    async updateUserReportsTo(reportingUserId, newReportsToUserId) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            if (newReportsToUserId === ES_1.default.NO_REPORTS_TO) {
                const userReportsToRelation = await this.userReportsToRepository.findUserReportsToRelationshipByReportingUserId(reportingUserId);
                if (!userReportsToRelation)
                    throw new NotFoundError_1.NotFoundError('UserReportsTo', reportingUserId);
                await this.userReportsToRepository.delete(userReportsToRelation);
                return null;
            }
            const newReportsToUser = await this.userRepository.findUserById(newReportsToUserId);
            if (!newReportsToUser)
                throw new NotFoundError_1.NotFoundError('User', newReportsToUserId);
            if (!newReportsToUser.selectable_as_leader)
                throw new BusinessLogicError_1.BusinessLogicError(`User ${newReportsToUserId} is not selectable as a leader.`);
            const userReportsToRelation = await this.userReportsToRepository.findUserReportsToRelationshipByReportingUserId(reportingUserId);
            if (!userReportsToRelation)
                throw new NotFoundError_1.NotFoundError('UserReportsTo', reportingUserId);
            if (reportingUserId === newReportsToUserId)
                throw new BusinessLogicError_1.BusinessLogicError(`User ${reportingUserId} cannot report to themselves.`);
            userReportsToRelation.reports_to_user_id = newReportsToUserId;
            return await this.userReportsToRepository.save(userReportsToRelation);
        });
    }
    async getLeaders() {
        return await this.userReportsToRepository.findAll();
    }
};
exports.UserReportsToService = UserReportsToService;
exports.UserReportsToService = UserReportsToService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserReportsToRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __metadata("design:paramtypes", [Object, Object])
], UserReportsToService);
//# sourceMappingURL=userReportsTo.service.js.map