import { logger } from '../../../../shared/utils/logger';
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
// import path from 'path';
// import express from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { DocumentController } from '../controllers/documents.controller';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../clients/s3.client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import appConfig from '../../../../shared/config/appConfig';
import { authenticateJWT } from '../../auth/middlewares/auth.middleware';

const documentController =
  container.get<DocumentController>(DocumentController);
const documentsRouter = Router();

const storage = multer.memoryStorage();

// Only raster images the editors actually embed. The stored extension comes
// from the MIME type, never from the client's filename, so nothing but an
// image can land under images/ (SVG is left out: it can carry script).
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/bmp': '.bmp',
};
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype in IMAGE_EXTENSIONS),
});

// Upload requires a signed-in intranet user (cookie session). It used to be
// open, so anyone on the internet could write files into the bucket.
documentsRouter.post(
  '/upload-image',
  authenticateJWT,
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('upload')(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({ error: 'Image is larger than 10 MB.' });
        return;
      }
      if (err) {
        next(err);
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Only PNG, JPEG, GIF, WebP or BMP images can be uploaded.' });
        return;
      }
      const ext = IMAGE_EXTENSIONS[req.file.mimetype];
      req.file.originalname = `image${ext}`;
      await documentController.createImageDocument(req, res);
    } catch (error) {
      next(error);
    }
  },
);

// const imagesDirectory = path.join(__dirname, '../', 'files', 'images');

// documentsRouter.use('/images', express.static(imagesDirectory));

documentsRouter.get('/images/:imageKey', async (req, res) => {
  const { imageKey } = req.params;

  if (appConfig.s3BucketName.length === 0) {
    res.status(500).send('S3 bucket name is not configured.');
    return;
  }
  if (!imageKey) {
    res.status(400).send('Image key is missing.');
    return;
  }
  // The Key must match the path used in your upload function
  const command = new GetObjectCommand({
    Bucket: appConfig.s3BucketName,
    Key: `images/${imageKey}`,
  });

  try {
    // Generate a signed URL that is valid for a short time (e.g., 15 minutes)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    // Redirect the browser to the secure, temporary S3 URL
    res.redirect(signedUrl);
  } catch (error) {
    logger.error(`Error generating signed URL for key: ${imageKey}`, error);
    // You can check for a 'NoSuchKey' error to send a more specific 404
    if ((error as any).name === 'NoSuchKey') {
      res.status(404).send('Image not found.');
      return;
    }
    res.status(500).send('Internal Server Error.');
    return;
  }
});

export { documentsRouter };
