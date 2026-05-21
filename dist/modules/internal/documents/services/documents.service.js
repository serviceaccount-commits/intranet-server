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
exports.DocumentService = void 0;
const logger_1 = require("../../../../shared/utils/logger");
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const data_source_1 = require("../../../../shared/database/data-source");
const Document_entity_1 = require("../entities/Document.entity");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_client_1 = require("../clients/s3.client");
let DocumentService = class DocumentService {
    documentRepository;
    constructor(documentRepository) {
        this.documentRepository = documentRepository;
    }
    async createDocument(fileName, fileType) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const newDocument = new Document_entity_1.Document();
            newDocument.file_name = fileName;
            newDocument.file_type = fileType;
            return await this.documentRepository.create(newDocument);
        });
    }
    async getDocuments() {
        return await this.documentRepository.findAll();
    }
    // TODO: Recieve actual file
    async createArticleDocument(articleContent) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const newDocument = new Document_entity_1.Document();
            newDocument.file_type = 'txt';
            const document = await this.documentRepository.create(newDocument);
            //! create an empty txt physical document with the created document's id as the name
            // await this.createLocalDocument(
            //   document.document_id,
            //   'articles',
            //   articleContent,
            // );
            await this.uploadDocumentToS3(document.document_id, 'articles', articleContent);
            //! return the created document object
            return document;
        });
    }
    async createClassDocument(file) {
        const newDocument = new Document_entity_1.Document();
        newDocument.file_name = 'class-document';
        newDocument.file_type = 'txt';
        const document = await this.documentRepository.create(newDocument);
        // await this.createLocalDocument(document.document_id, 'classes', file);
        await this.uploadDocumentToS3(document.document_id, 'classes', file);
        return document;
    }
    async createAnnouncementDocument(file) {
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const newDocument = new Document_entity_1.Document();
            newDocument.file_name = 'announcement-document';
            newDocument.file_type = 'txt';
            const document = await this.documentRepository.create(newDocument);
            //! create an empty txt physical document with the created document's id as the name
            // await this.createLocalDocument(
            //   document.document_id,
            //   'announcements',
            //   file,
            // );
            await this.uploadDocumentToS3(document.document_id, 'announcements', file);
            //! return the created document object
            return document;
        });
    }
    async getLocalDocument(documentId, type) {
        const filePath = path_1.default.join(__dirname, '../', 'files', type, `${documentId}.txt`);
        const file = await promises_1.default.readFile(filePath, { encoding: 'utf-8' });
        return file;
    }
    async updateLocalDocument(documentId, type, documentFile) {
        const filename = `${documentId}.txt`;
        const filePath = path_1.default.join(__dirname, '../', 'files', type, filename);
        await promises_1.default.writeFile(filePath, typeof documentFile === 'string'
            ? documentFile
            : documentFile.buffer.toString(), { encoding: 'utf-8' });
    }
    async createLocalDocument(documentId, type, documentFile) {
        const filename = `${documentId}.txt`;
        const filePath = path_1.default.join(__dirname, '../', 'files', type, filename);
        const directory = path_1.default.join(__dirname, '../', 'files', type);
        await promises_1.default.mkdir(directory, { recursive: true });
        await promises_1.default.writeFile(filePath, typeof documentFile === 'string'
            ? documentFile
            : documentFile.buffer.toString(), { encoding: 'utf-8' });
        return;
    }
    async saveLocalImage(documentId, documentFile) {
        // Get the original file extension (e.g., '.png', '.jpg')
        const fileExtension = path_1.default.extname(documentFile.originalname);
        const filename = `${documentId}${fileExtension}`;
        const directory = path_1.default.join(__dirname, '../', 'files', 'images');
        // Ensure the 'images' directory exists
        await promises_1.default.mkdir(directory, { recursive: true });
        const filePath = path_1.default.join(directory, filename);
        // CRITICAL CHANGE: Write the raw buffer directly for images
        await promises_1.default.writeFile(filePath, documentFile.buffer);
    }
    /**
     * Replaces: getLocalDocument
     * Retrieves a text document from S3.
     */
    async getDocumentFromS3(documentId, type) {
        // In S3, the "path" is called a "Key". We'll mimic your folder structure.
        const key = `${type}/${documentId}.txt`;
        const command = new client_s3_1.GetObjectCommand({
            Bucket: s3_client_1.bucketName,
            Key: key,
        });
        try {
            const response = await s3_client_1.s3Client.send(command);
            // The body of the object is a stream. We need to convert it to a string.
            const fileContent = await response.Body?.transformToString('utf-8');
            if (fileContent === undefined) {
                throw new Error('S3 object body is empty');
            }
            return fileContent;
        }
        catch (error) {
            logger_1.logger.error(`Failed to get document from S3: ${key}`, error);
            // Re-throw the error so the calling  can handle it (e.g., return a 404)
            throw error;
        }
    }
    /**
     * Replaces: createLocalDocument and updateLocalDocument
     * Creates or overwrites a text document in S3.
     */
    async uploadDocumentToS3(documentId, type, documentFile) {
        const key = `${type}/${documentId}.txt`;
        // Determine the content to upload
        const fileContent = typeof documentFile === 'string' ? documentFile : documentFile.buffer;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: s3_client_1.bucketName,
            Key: key,
            Body: fileContent,
            ContentType: 'text/plain', // Good practice to set the MIME type
        });
        await s3_client_1.s3Client.send(command);
    }
    /**
     * Replaces: saveLocalImage
     * Uploads an image file to S3.
     */
    async uploadImageToS3(documentId, documentFile) {
        const fileExtension = path_1.default.extname(documentFile.originalname);
        const key = `images/${documentId}${fileExtension}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: s3_client_1.bucketName,
            Key: key,
            Body: documentFile.buffer, // Use the raw buffer for images
            ContentType: documentFile.mimetype, // Use the original MIME type from multer
        });
        await s3_client_1.s3Client.send(command);
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IDocumentRepository)),
    __metadata("design:paramtypes", [Object])
], DocumentService);
//# sourceMappingURL=documents.service.js.map