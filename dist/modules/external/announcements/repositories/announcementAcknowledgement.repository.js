"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementAcknowledgementRepository = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const AnnouncementAcknowledgement_entity_1 = require("../entity/AnnouncementAcknowledgement.entity");
let AnnouncementAcknowledgementRepository = class AnnouncementAcknowledgementRepository {
    async create(announcementAcknowledgement, announcement, user) {
        announcementAcknowledgement.user = user;
        announcementAcknowledgement.user_id = user.user_id;
        announcementAcknowledgement.announcement = announcement;
        announcementAcknowledgement.announcement_id = announcement.announcement_id;
        await data_source_1.AppDataSource.manager.save(announcementAcknowledgement);
    }
    async findByAnnouncementAndUserId(announcementId, userId) {
        return await data_source_1.AppDataSource.manager.findOne(AnnouncementAcknowledgement_entity_1.AnnouncementAcknowledgement, {
            where: { user_id: userId, announcement_id: announcementId },
            relations: {
                announcement: true,
                user: true,
            },
        });
    }
    async findAll() {
        return await data_source_1.AppDataSource.manager.find(AnnouncementAcknowledgement_entity_1.AnnouncementAcknowledgement);
    }
};
exports.AnnouncementAcknowledgementRepository = AnnouncementAcknowledgementRepository;
exports.AnnouncementAcknowledgementRepository = AnnouncementAcknowledgementRepository = __decorate([
    (0, inversify_1.injectable)()
], AnnouncementAcknowledgementRepository);
//# sourceMappingURL=announcementAcknowledgement.repository.js.map