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
exports.DocumentController = void 0;
const logger_1 = require("../../../../shared/utils/logger");
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const uuid_1 = require("uuid");
const appConfig_1 = __importDefault(require("../../../../shared/config/appConfig"));
const path_1 = __importDefault(require("path"));
let DocumentController = class DocumentController {
    documentService;
    constructor(documentService) {
        this.documentService = documentService;
    }
    async createImageDocument(req, res) {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded.' });
            return;
        }
        try {
            // 1. Generate a unique ID for the new image
            const imageId = (0, uuid_1.v4)();
            // 2. Call your modified service function to save the file
            await this.documentService.uploadImageToS3(imageId, req.file);
            // 3. Construct the public URL that the editor can use to display the image
            const baseUrl = appConfig_1.default.backendUrl;
            const fileExtension = path_1.default.extname(req.file.originalname);
            const publicUrl = `${baseUrl}/api/v1/documents/images/${imageId}${fileExtension}`;
            // 4. Respond to CKEditor with the required JSON format
            res.status(200).json({
                url: publicUrl,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to upload image:', error);
            res
                .status(500)
                .json({ error: 'An error occurred while uploading the file.' });
        }
    }
};
exports.DocumentController = DocumentController;
exports.DocumentController = DocumentController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IDocumentService)),
    __metadata("design:paramtypes", [Object])
], DocumentController);
//# sourceMappingURL=documents.controller.js.map