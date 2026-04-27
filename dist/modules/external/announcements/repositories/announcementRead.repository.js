"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementReadRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const AnnouncementRead_entity_1 = require("../entity/AnnouncementRead.entity");
let AnnouncementReadRepository = class AnnouncementReadRepository {
    async create(announcementRead) {
        await data_source_1.AppDataSource.manager.save(announcementRead);
    }
    async findByAnnouncementAndUserId(announcementId, userId) {
        return await data_source_1.AppDataSource.manager.findOne(AnnouncementRead_entity_1.AnnouncementRead, {
            where: { user_id: userId, announcement_id: announcementId },
            relations: {
                announcement: true,
                user: true,
            },
        });
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(AnnouncementRead_entity_1.AnnouncementRead);
    }
    async findAllByAnnouncementId(announcementId) {
        return await data_source_1.AppDataSource.manager.find(AnnouncementRead_entity_1.AnnouncementRead, {
            where: { announcement_id: announcementId },
            relations: {
                announcement: true,
                user: true,
            },
        });
    }
};
exports.AnnouncementReadRepository = AnnouncementReadRepository;
exports.AnnouncementReadRepository = AnnouncementReadRepository = __decorate([
    (0, inversify_1.injectable)()
], AnnouncementReadRepository);
//# sourceMappingURL=announcementRead.repository.js.map