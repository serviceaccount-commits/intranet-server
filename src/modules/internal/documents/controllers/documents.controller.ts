import { logger } from '../../../../shared/utils/logger';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IDocumentService } from '../interfaces/documents.service.interface';
import { v4 as uuidv4 } from 'uuid';
import appConfig from '../../../../shared/config/appConfig';
import path from 'path';

@injectable()
export class DocumentController {
  constructor(
    @inject(TYPES.IDocumentService) private documentService: IDocumentService,
  ) {}

  async createImageDocument(req: Request, res: Response) {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    try {
      // 1. Generate a unique ID for the new image
      const imageId = uuidv4();

      // 2. Call your modified service function to save the file
      await this.documentService.uploadImageToS3(imageId, req.file);

      // 3. Construct the public URL that the editor can use to display the image
      const baseUrl = appConfig.backendUrl;
      const fileExtension = path.extname(req.file.originalname);
      const publicUrl = `${baseUrl}/api/v1/documents/images/${imageId}${fileExtension}`;

      // 4. Respond to CKEditor with the required JSON format
      res.status(200).json({
        url: publicUrl,
      });
    } catch (error) {
      logger.error('Failed to upload image:', error);
      res
        .status(500)
        .json({ error: 'An error occurred while uploading the file.' });
    }
  }
}
