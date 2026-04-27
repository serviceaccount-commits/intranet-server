import { injectable } from 'inversify';
import { IDocumentRepository } from '../interfaces/documents.repository.interface';
import { Document } from '../entities/Document.entity';
import { AppDataSource } from '../../../../shared/database/data-source';

@injectable()
export class DocumentRepository implements IDocumentRepository {
  async create(document: Document): Promise<Document> {
    return await AppDataSource.manager.save(document);
  }

  async findById(id: string): Promise<Document | null> {
    return await AppDataSource.manager.findOne(Document, {
      where: { document_id: id },
    });
  }

  async findAll(): Promise<Document[]> {
    return await AppDataSource.manager.find(Document);
  }
}
