import { Comment } from '../../entities/Comment.entity';

export interface ICommentRepository {
  create(comment: Comment): Promise<Comment>;

  findAll(classId: string): Promise<Comment[]>;
  findActiveByClassId(classId: string): Promise<Comment[]>;

  findById(id: string): Promise<Comment | null>;
  save(topic: Comment): Promise<Comment>;
}
