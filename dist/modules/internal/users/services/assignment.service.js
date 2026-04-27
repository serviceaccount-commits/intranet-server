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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentService = void 0;
const inversify_1 = require("inversify");
const Assignment_entity_1 = require("../entities/Assignment.entity");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const ConflictError_1 = require("../../../../shared/errors/ConflictError");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
let AssignmentService = class AssignmentService {
    assignmentRepository;
    constructor(assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }
    async createAssignment(assignmentName) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const existingAssignment = await this.assignmentRepository.findByName(assignmentName);
            if (existingAssignment) {
                throw new ConflictError_1.ConflictError(`Assignment with name ${assignmentName} already exists.`);
            }
            const newAssignment = new Assignment_entity_1.Assignment();
            newAssignment.assignment_name = assignmentName;
            return await this.assignmentRepository.create(newAssignment);
        });
    }
    async getAssignments() {
        return await this.assignmentRepository.findAll();
    }
    async updateAssignment(assignmentId, newAssignmentName) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const assignment = await this.assignmentRepository.findById(assignmentId);
            if (!assignment) {
                throw new NotFoundError_1.NotFoundError('Assignment', assignmentId);
            }
            assignment.assignment_name = newAssignmentName;
            return await this.assignmentRepository.save(assignment);
        });
    }
};
exports.AssignmentService = AssignmentService;
exports.AssignmentService = AssignmentService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IAssignmentRepository)),
    __metadata("design:paramtypes", [Object])
], AssignmentService);
//# sourceMappingURL=assignment.service.js.map