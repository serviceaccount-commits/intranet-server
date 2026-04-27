import { injectable } from 'inversify';
import { ICommentRepository } from '../interfaces/comments/comment.repository.interface';
import { AppDataSource } from '../../../../shared/database/data-source';
import { Comment } from '../entities/Comment.entity';
import ES from '../../../../shared/types/enum/ES';

@injectable()
export class CommentRepository implements ICommentRepository {
  async create(comment: Comment): Promise<Comment> {
    return AppDataSource.manager.save(comment);
  }

  async findAll(classId: string): Promise<Comment[]> {
    return AppDataSource.manager.find(Comment, {
      where: {
        class_id: classId,
      },
      relations: {
        user: true,
      },
    });
  }

  async findActiveByClassId(classId: string): Promise<Comment[]> {
    return AppDataSource.manager.find(Comment, {
      where: {
        class_id: classId,
        comment_status: ES.ACTIVE,
      },
      relations: {
        user: true,
      },
    });
  }

  async findById(id: string): Promise<Comment | null> {
    return AppDataSource.manager.findOne(Comment, {
      where: {
        comment_id: id,
      },
      relations: {
        user: true,
      },
    });
  }
  async save(comment: Comment): Promise<Comment> {
    return AppDataSource.manager.save(comment);
  }
}
