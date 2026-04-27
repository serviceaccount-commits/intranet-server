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

const documentController =
  container.get<DocumentController>(DocumentController);
const documentsRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

documentsRouter.post(
  '/upload-image',
  upload.single('upload'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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
