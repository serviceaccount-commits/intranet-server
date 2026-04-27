import { logger } from '../../../../shared/utils/logger';
import { inject, injectable } from 'inversify';
import { IDocumentService } from '../interfaces/documents.service.interface';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IDocumentRepository } from '../interfaces/documents.repository.interface';
import { AppDataSource } from '../../../../shared/database/data-source';
import { Document } from '../entities/Document.entity';

import fs from 'fs/promises';
import path from 'path';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { bucketName, s3Client } from '../clients/s3.client';

type DocumentType = 'articles' | 'images' | 'announcements' | 'classes';

@injectable()
export class DocumentService implements IDocumentService {
  constructor(
    @inject(TYPES.IDocumentRepository)
    private documentRepository: IDocumentRepository,
  ) {}

  async createDocument(
    fileName: string,
    fileType: 'img' | 'txt' | 'png' | 'unknown',
  ): Promise<Document> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const newDocument = new Document();
      newDocument.file_name = fileName;
      newDocument.file_type = fileType;
      return await this.documentRepository.create(newDocument);
    });
  }

  async getDocuments(): Promise<Document[]> {
    return await this.documentRepository.findAll();
  }

  // TODO: Recieve actual file
  async createArticleDocument(articleContent: string): Promise<Document> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const newDocument = new Document();

      newDocument.file_type = 'txt';

      const document: Document =
        await this.documentRepository.create(newDocument);

      //! create an empty txt physical document with the created document's id as the name
      // await this.createLocalDocument(
      //   document.document_id,
      //   'articles',
      //   articleContent,
      // );

      await this.uploadDocumentToS3(
        document.document_id,
        'articles',
        articleContent,
      );

      //! return the created document object
      return document;
    });
  }

  async createClassDocument(file: string): Promise<Document> {
    const newDocument = new Document();
    newDocument.file_name = 'class-document';
    newDocument.file_type = 'txt';

    const document: Document =
      await this.documentRepository.create(newDocument);

    // await this.createLocalDocument(document.document_id, 'classes', file);
    await this.uploadDocumentToS3(document.document_id, 'classes', file);

    return document;
  }

  async createAnnouncementDocument(
    file: Express.Multer.File | string,
  ): Promise<Document> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const newDocument = new Document();
      newDocument.file_name = 'announcement-document';
      newDocument.file_type = 'txt';

      const document: Document =
        await this.documentRepository.create(newDocument);

      //! create an empty txt physical document with the created document's id as the name
      // await this.createLocalDocument(
      //   document.document_id,
      //   'announcements',
      //   file,
      // );
      await this.uploadDocumentToS3(
        document.document_id,
        'announcements',
        file,
      );

      //! return the created document object
      return document;
    });
  }

  async getLocalDocument(
    documentId: string,
    type: 'articles' | 'images' | 'announcements' | 'classes',
  ): Promise<string> {
    const filePath = path.join(
      __dirname,
      '../',
      'files',
      type,
      `${documentId}.txt`,
    );
    const file = await fs.readFile(filePath, { encoding: 'utf-8' });
    return file;
  }

  async updateLocalDocument(
    documentId: string,
    type: 'articles' | 'images' | 'announcements' | 'classes',
    documentFile: Express.Multer.File | string,
  ): Promise<void> {
    const filename = `${documentId}.txt`;
    const filePath = path.join(__dirname, '../', 'files', type, filename);


    await fs.writeFile(
      filePath,
      typeof documentFile === 'string'
        ? documentFile
        : documentFile.buffer.toString(),
      { encoding: 'utf-8' },
    );
  }

  async createLocalDocument(
    documentId: string,
    type: 'articles' | 'images' | 'announcements' | 'classes',
    documentFile: Express.Multer.File | string,
  ): Promise<void> {
    const filename = `${documentId}.txt`;
    const filePath = path.join(__dirname, '../', 'files', type, filename);

    const directory = path.join(__dirname, '../', 'files', type);
    await fs.mkdir(directory, { recursive: true });


    await fs.writeFile(
      filePath,
      typeof documentFile === 'string'
        ? documentFile
        : documentFile.buffer.toString(),
      { encoding: 'utf-8' },
    );

    return;
  }

  async saveLocalImage(
    documentId: string,
    documentFile: Express.Multer.File,
  ): Promise<void> {
    // Get the original file extension (e.g., '.png', '.jpg')
    const fileExtension = path.extname(documentFile.originalname);
    const filename = `${documentId}${fileExtension}`;

    const directory = path.join(__dirname, '../', 'files', 'images');
    // Ensure the 'images' directory exists
    await fs.mkdir(directory, { recursive: true });

    const filePath = path.join(directory, filename);

    // CRITICAL CHANGE: Write the raw buffer directly for images
    await fs.writeFile(filePath, documentFile.buffer);
  }

  /**
   * Replaces: getLocalDocument
   * Retrieves a text document from S3.
   */
  async getDocumentFromS3(
    documentId: string,
    type: DocumentType,
  ): Promise<string> {
    // In S3, the "path" is called a "Key". We'll mimic your folder structure.
    const key = `${type}/${documentId}.txt`;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    try {
      const response = await s3Client.send(command);
      // The body of the object is a stream. We need to convert it to a string.
      const fileContent = await response.Body?.transformToString('utf-8');
      if (fileContent === undefined) {
        throw new Error('S3 object body is empty');
      }
      return fileContent;
    } catch (error) {
      logger.error(`Failed to get document from S3: ${key}`, error);
      // Re-throw the error so the calling  can handle it (e.g., return a 404)
      throw error;
    }
  }

  /**
   * Replaces: createLocalDocument and updateLocalDocument
   * Creates or overwrites a text document in S3.
   */
  async uploadDocumentToS3(
    documentId: string,
    type: DocumentType,
    documentFile: Express.Multer.File | string,
  ): Promise<void> {
    const key = `${type}/${documentId}.txt`;

    // Determine the content to upload
    const fileContent =
      typeof documentFile === 'string' ? documentFile : documentFile.buffer;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ContentType: 'text/plain', // Good practice to set the MIME type
    });

    await s3Client.send(command);
  }

  /**
   * Replaces: saveLocalImage
   * Uploads an image file to S3.
   */
  async uploadImageToS3(
    documentId: string,
    documentFile: Express.Multer.File,
  ): Promise<void> {
    const fileExtension = path.extname(documentFile.originalname);
    const key = `images/${documentId}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: documentFile.buffer, // Use the raw buffer for images
      ContentType: documentFile.mimetype, // Use the original MIME type from multer
    });

    await s3Client.send(command);
  }
}
