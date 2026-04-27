"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRepository = void 0;
const inversify_1 = require("inversify");
const Document_entity_1 = require("../entities/Document.entity");
const data_source_1 = require("../../../../shared/database/data-source");
let DocumentRepository = class DocumentRepository {
    async create(document) {
        return await data_source_1.AppDataSource.manager.save(document);
    }
    async findById(id) {
        return await data_source_1.AppDataSource.manager.findOne(Document_entity_1.Document, {
            where: { document_id: id },
        });
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(Document_entity_1.Document);
    }
};
exports.DocumentRepository = DocumentRepository;
exports.DocumentRepository = DocumentRepository = __decorate([
    (0, inversify_1.injectable)()
], DocumentRepository);
//# sourceMappingURL=documents.repository.js.map