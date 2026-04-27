import { Document } from '../entities/Document.entity';

Document;

type DocumentType = 'articles' | 'images' | 'announcements' | 'classes';

export interface IDocumentService {
  createDocument(
    file_name: string,
    file_type: 'img' | 'txt' | 'png' | 'unknown',
  ): Promise<Document>;

  getDocuments(): Promise<Document[]>;

  createArticleDocument(articleContent: string): Promise<Document>;

  createAnnouncementDocument(
    file: Express.Multer.File | string,
  ): Promise<Document>;
  createClassDocument(fileName: string): Promise<Document>;

  getLocalDocument(
    documentId: string,
    type: 'articles' | 'images' | 'announcements' | 'classes',
  ): Promise<string>;

  updateLocalDocument(
    documentId: string,
    type: 'articles' | 'images' | 'announcements' | 'classes',
    documentFile: Express.Multer.File | string,
  ): Promise<void>;

  createLocalDocument(
    documentId: string,
    type: 'articles' | 'images' | 'announcements' | 'classes',
    documentFile: Express.Multer.File | string,
  ): Promise<void>;
  saveLocalImage(
    documentId: string,
    documentFile: Express.Multer.File,
  ): Promise<void>;

  getDocumentFromS3(documentId: string, type: DocumentType): Promise<string>;
  uploadDocumentToS3(
    documentId: string,
    type: DocumentType,
    documentFile: Express.Multer.File | string,
  ): Promise<void>;

  uploadImageToS3(
    documentId: string,
    documentFile: Express.Multer.File,
  ): Promise<void>;
}
