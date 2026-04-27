"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const Comment_entity_1 = require("../entities/Comment.entity");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
let CommentRepository = class CommentRepository {
    async create(comment) {
        return data_source_1.AppDataSource.manager.save(comment);
    }
    async findAll(classId) {
        return data_source_1.AppDataSource.manager.find(Comment_entity_1.Comment, {
            where: {
                class_id: classId,
            },
            relations: {
                user: true,
            },
        });
    }
    async findActiveByClassId(classId) {
        return data_source_1.AppDataSource.manager.find(Comment_entity_1.Comment, {
            where: {
                class_id: classId,
                comment_status: ES_1.default.ACTIVE,
            },
            relations: {
                user: true,
            },
        });
    }
    async findById(id) {
        return data_source_1.AppDataSource.manager.findOne(Comment_entity_1.Comment, {
            where: {
                comment_id: id,
            },
            relations: {
                user: true,
            },
        });
    }
    async save(comment) {
        return data_source_1.AppDataSource.manager.save(comment);
    }
};
exports.CommentRepository = CommentRepository;
exports.CommentRepository = CommentRepository = __decorate([
    (0, inversify_1.injectable)()
], CommentRepository);
//# sourceMappingURL=comment.repository.js.map