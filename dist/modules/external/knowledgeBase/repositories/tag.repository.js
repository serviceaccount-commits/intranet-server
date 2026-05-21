"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagRepository = void 0;
const inversify_1 = require("inversify");
const mongodb_1 = require("mongodb");
const kb_collections_1 = require("../database/kb-collections");
const mongo_connection_1 = require("../../../../shared/database/mongo-connection");
let TagRepository = class TagRepository {
    get col() {
        return (0, kb_collections_1.getTagsCollection)((0, mongo_connection_1.getMongoDb)());
    }
    async create(input) {
        const now = new Date();
        const doc = {
            _id: new mongodb_1.ObjectId(),
            tag_name: input.tag_name.trim(),
            createdAt: now,
            updatedAt: now,
        };
        await this.col.insertOne(doc);
        return doc;
    }
    async findAll() {
        return this.col.find({}).sort({ tag_name: 1 }).toArray();
    }
    async findById(id) {
        if (!mongodb_1.ObjectId.isValid(id))
            return null;
        return this.col.findOne({ _id: new mongodb_1.ObjectId(id) });
    }
    async findByIds(ids) {
        const oids = ids
            .filter((id) => mongodb_1.ObjectId.isValid(id))
            .map((id) => new mongodb_1.ObjectId(id));
        if (oids.length === 0)
            return [];
        return this.col.find({ _id: { $in: oids } }).toArray();
    }
    async findByName(name) {
        return this.col.findOne({ tag_name: name }, { collation: { locale: 'en', strength: 2 } });
    }
};
exports.TagRepository = TagRepository;
exports.TagRepository = TagRepository = __decorate([
    (0, inversify_1.injectable)()
], TagRepository);
//# sourceMappingURL=tag.repository.js.map