"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentsRouter = void 0;
const logger_1 = require("../../../../shared/utils/logger");
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
const auth_middleware_1 = require("../../auth/middlewares/auth.middleware");
const documentController = inversify_config_1.container.get(documents_controller_1.DocumentController);
const documentsRouter = (0, express_1.Router)();
exports.documentsRouter = documentsRouter;
const storage = multer_1.default.memoryStorage();
// Only raster images the editors actually embed. The stored extension comes
// from the MIME type, never from the client's filename, so nothing but an
// image can land under images/ (SVG is left out: it can carry script).
const IMAGE_EXTENSIONS = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
};
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => cb(null, file.mimetype in IMAGE_EXTENSIONS),
});
// Upload requires a signed-in intranet user (cookie session). It used to be
// open, so anyone on the internet could write files into the bucket.
documentsRouter.post('/upload-image', auth_middleware_1.authenticateJWT, (req, res, next) => {
    upload.single('upload')(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            res.status(413).json({ error: 'Image is larger than 10 MB.' });
            return;
        }
        if (err) {
            next(err);
            return;
        }
        next();
    });
}, async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Only PNG, JPEG, GIF, WebP or BMP images can be uploaded.' });
            return;
        }
        const ext = IMAGE_EXTENSIONS[req.file.mimetype];
        req.file.originalname = `image${ext}`;
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
        logger_1.logger.error(`Error generating signed URL for key: ${imageKey}`, error);
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