"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.AnnouncementInboxService = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const ES_1 = __importDefault(require("../../../../shared/types/enum/ES"));
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const BusinessLogicError_1 = require("../../../../shared/errors/BusinessLogicError");
const cheerio = __importStar(require("cheerio"));
let AnnouncementInboxService = class AnnouncementInboxService {
    announcementRepository;
    documentService;
    constructor(announcementRepository, documentService) {
        this.announcementRepository = announcementRepository;
        this.documentService = documentService;
    }
    async getAnnouncements() {
        return this.announcementRepository.findAll();
    }
    async getInbox(userId, filters) {
        return this.announcementRepository.findAndCountAllInbox(userId, filters);
    }
    async getSent(userId, filters) {
        const ann = await this.announcementRepository.findAndCountAllSent(userId, filters);
        const announcements = [];
        for (const a of ann.announcements) {
            if (a.type === ES_1.default.REGULAR) {
                if (!a.document)
                    continue;
                announcements.push({
                    announcement_id: a.announcement_id,
                    priority_level: a.priority_level,
                    created_at: a.created_at.toISOString(),
                    title: a.title,
                    preview: await this.getAnnouncementCleanContent(a.announcement_id),
                    open_acknowledge_until: a.open_acknowledge_until.toISOString(),
                    user: {
                        user_id: a.user.user_id,
                        first_name: a.user.first_name,
                        last_name: a.user.last_name,
                    },
                    acknowledgements: a.acknowledgements || [],
                    type: a.type,
                });
            }
            if (a.type === ES_1.default.PERSISTENT) {
                announcements.push({
                    announcement_id: a.announcement_id,
                    priority_level: a.priority_level,
                    created_at: a.created_at.toISOString(),
                    title: a.title,
                    preview: a.preview,
                    open_acknowledge_until: a.open_acknowledge_until.toISOString(),
                    user: {
                        user_id: a.user.user_id,
                        first_name: a.user.first_name,
                        last_name: a.user.last_name,
                    },
                    acknowledgements: a.acknowledgements || [],
                    type: a.type,
                });
            }
        }
        return { announcements, total: ann.total };
    }
    async getAnnouncementById(announcementId) {
        const announcement = await this.announcementRepository.findByIdWithNoDocument(announcementId);
        if (!announcement) {
            throw new Error(`Announcement with id ${announcementId} does not exist.`);
        }
        let fileContent = '';
        if (announcement.type === ES_1.default.REGULAR) {
            const announcementWithDocument = await this.announcementRepository.findById(announcementId);
            if (!announcementWithDocument)
                throw new NotFoundError_1.NotFoundError('Announcement', announcementId);
            if (!announcementWithDocument.document)
                throw new NotFoundError_1.NotFoundError('Announcement Document', announcementId);
            fileContent = await this.documentService.getDocumentFromS3(announcementWithDocument.document.document_id, 'announcements');
        }
        else {
            fileContent = announcement.preview;
        }
        return { announcement, content: fileContent };
    }
    async getAnnouncementCleanContent(announcementId) {
        const announcement = await this.announcementRepository.findById(announcementId);
        if (!announcement)
            throw new NotFoundError_1.NotFoundError('Announcement not found', announcementId);
        const rawContent = await this.documentService.getDocumentFromS3(announcement.document.document_id, 'announcements');
        const $ = cheerio.load(rawContent);
        $('p, li, h1, h2, h3, div, th, td, blockquote').after(' ');
        const text = $('body').text();
        const cleanText = text.replace(/\s+/g, ' ').trim();
        if (!cleanText)
            throw new BusinessLogicError_1.BusinessLogicError('Invalid input format');
        return cleanText;
    }
    async findBannerAnnouncements(userId) {
        const regularAnn = await this.announcementRepository.findNonAcknowledgedHighAndMediumPriorityAnnouncements(userId);
        const persistentAnn = await this.announcementRepository.findPersistentAnnouncements(userId);
        return { regular: regularAnn, persistent: persistentAnn };
    }
};
exports.AnnouncementInboxService = AnnouncementInboxService;
exports.AnnouncementInboxService = AnnouncementInboxService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IAnnouncementRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IDocumentService)),
    __metadata("design:paramtypes", [Object, Object])
], AnnouncementInboxService);
//# sourceMappingURL=announcement-inbox.service.js.map