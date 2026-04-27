import ES from '../../../../../shared/types/enum/ES';
import { Class } from '../../entities/Class.entity';
import { Comment } from '../../entities/Comment.entity';
import { CreateClassInput } from '../../schema/classes/CreateClassSchema';
import { UpdateClassInput } from '../../schema/classes/UpdateClassSchema';
import { CreateCommentInput } from '../../schema/comments/CreateCommentSchema';
import { UpdateCommentInput } from '../../schema/comments/UpdateCommentSchema';
import {
  ClassWithContent,
  ClassWithContentAndUserValueAndUserExamStatus,
} from '../../types/Training.types';

export interface IClassService {
  createClass(input: CreateClassInput): Promise<Class>;
  updateClass(classId: string, input: UpdateClassInput): Promise<Class>;
  updateClassUserValue(
    classId: string,
    userId: string,
    completionStatus: ES.COMPLETED | ES.INCOMPLETE,
  ): Promise<void>;
  getClasses(topicId: string): Promise<Class[]>;
  getClassById(classId: string): Promise<ClassWithContent>;
  getClassByIdWithUserValueAndExam(
    classId: string,
    userId: string,
  ): Promise<ClassWithContentAndUserValueAndUserExamStatus>;

  addCommentToClass(classId: string, input: CreateCommentInput): Promise<void>;
  updateComment(commentId: string, input: UpdateCommentInput): Promise<void>;
  getComments(classId: string): Promise<Comment[]>;
  getClassActiveComments(classId: string): Promise<Comment[]>;
  getCommentById(commentId: string): Promise<Comment>;
}
