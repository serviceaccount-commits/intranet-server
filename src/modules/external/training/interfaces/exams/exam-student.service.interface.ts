import ES from '../../../../../shared/types/enum/ES';
import { UserFacingExam } from '../../types/Training.types';

export interface IExamStudentService {
  getUserExam(classId: string, userId: string): Promise<UserFacingExam | void>;
  getUserExamNoAttemptLimit(classId: string, userId: string): Promise<UserFacingExam | void>;
  getUserExamStatus(
    classId: string,
    userId: string,
  ): Promise<ES.PASSED | ES.FAILED | ES.CAN_RETAKE | ES.NOT_ATTEMPTED | ES.NO_EXAM>;
}
