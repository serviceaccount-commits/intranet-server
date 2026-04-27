import { Document } from '../entities/Document.entity';

export interface IDocumentRepository {
  create(document: Document): Promise<Document>;

  findById(id: string): Promise<Document | null>;

  findAll(): Promise<Document[]>;
}
