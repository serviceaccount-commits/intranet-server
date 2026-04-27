"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentsRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
// import path from 'path';
// import express from 'express';
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const documents_controller_1 = require("../controllers/documents.controller");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_client_1 = require("../clients/s3.client");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const appConfig_1 = __importDefault(require("../../../../shared/config/appConfig"));
const documentController = inversify_config_1.container.get(documents_controller_1.DocumentController);
const documentsRouter = (0, express_1.Router)();
exports.documentsRouter = documentsRouter;
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
documentsRouter.post('/upload-image', upload.single('upload'), async (req, res, next) => {
    try {
        await documentController.createImageDocument(req, res);
    }
    catch (error) {
        next(error);
    }
});
// const imagesDirectory = path.join(__dirname, '../', 'files', 'images');
// documentsRouter.use('/images', express.static(imagesDirectory));
documentsRouter.get('/images/:imageKey', async (req, res) => {
    const { imageKey } = req.params;
    if (appConfig_1.default.s3BucketName.length === 0) {
        res.status(500).send('S3 bucket name is not configured.');
        return;
    }
    if (!imageKey) {
        res.status(400).send('Image key is missing.');
        return;
    }
    // The Key must match the path used in your upload function
    const command = new client_s3_1.GetObjectCommand({
        Bucket: appConfig_1.default.s3BucketName,
        Key: `images/${imageKey}`,
    });
    try {
        // Generate a signed URL that is valid for a short time (e.g., 15 minutes)
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_client_1.s3Client, command, { expiresIn: 900 });
        // Redirect the browser to the secure, temporary S3 URL
        res.redirect(signedUrl);
    }
    catch (error) {
        console.error(`Error generating signed URL for key: ${imageKey}`, error);
        // You can check for a 'NoSuchKey' error to send a more specific 404
        if (error.name === 'NoSuchKey') {
            res.status(404).send('Image not found.');
            return;
        }
        res.status(500).send('Internal Server Error.');
        return;
    }
});
//# sourceMappingURL=documents.router.js.map