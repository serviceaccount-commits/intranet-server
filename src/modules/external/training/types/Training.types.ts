import ES from '../../../../shared/types/enum/ES';
import { Class } from '../entities/Class.entity';
import { ClassUserValue } from '../entities/ClassUserValue.entity';
import { Exam } from '../entities/Exam.entity';
import { Option } from '../entities/Option.entity';
import { Question } from '../entities/Question.entity';
import { QuestionType } from '../entities/QuestionType.entity';
import { UserAnswer } from '../entities/UserAnswers.entity';
import { UserExamAttempt } from '../entities/UserExamAttempts.entity';

export interface ClassWithContent {
  class: Class;
  content: string;
}

export interface UserFacingOption {
  option_id: string;
  option_text: string;
}

export interface UserFacingQuestion {
  question_id: string;
  question_text: string;
  options: UserFacingOption[];
  question_type: QuestionType;
}

export interface UserFacingExam {
  exam_id: string;
  exam_title: string;
  passing_score: number;
  max_attempts: number;
  version: number;
  questions: UserFacingQuestion[];
  exam_status: ES.PUBLISHED | ES.DRAFT | ES.OUTDATED;
}

export interface ClassWithContentAndUserValueAndUserExam {
  classData: ClassWithContentAndUserValue;
  userExamData: UserFacingExam | UserExamWithAnswers | void;
}

export interface ClassWithContentAndUserValueAndUserExamStatus {
  classData: ClassWithContentAndUserValue;
  userExamStatus:
    | ES.PASSED
    | ES.FAILED
    | ES.CAN_RETAKE
    | ES.NOT_ATTEMPTED
    | ES.NO_EXAM;
}

export interface ClassWithContentAndUserValue {
  class: Class;
  content: string;
  userValue: ClassUserValue;
}

export interface UserExamWithAnswers {
  exam: Exam;
  attempt: UserExamAttempt;
  answers: UserAnswer[];
  attemptCount: number;
}

export interface QuestionWithSeparatedOptions {
  question: Question;
  options: Option[];
}

export interface ExamMetadata {
  exam_id: string;
  exam_title: string;
  version: number;
  exam_status: ES.PUBLISHED | ES.DRAFT | ES.OUTDATED;
  created_at: Date;
}

export interface UserExamMetadata {
  user_id: string;
  first_name: string;
  last_name: string;
  course_name: string;
  topic_name: string;
  class_id: string;
  class_name: string;
  status: ES.PASSED | ES.FAILED | ES.NOT_ATTEMPTED;
  score: number;
  exam_id: string;
  user_valid_attempts_count: number;
  exam_max_attempts: number;
  exam_version: number;
  attempt_date: Date;
}

export interface UserExamAttemptDashboardResult {
  attempt_id: string;
  attempt_date: Date;
  score: number;
  status: ES.PASSED | ES.FAILED;
  user_id: string;
  first_name: string;
  last_name: string;
  exam_id: string;
  exam_max_attempts: number;
  exam_version: number;
  class_id: string;
  class_name: string;
  topic_name: string;
  course_name: string;
}

export interface AdminOption {
  option_id: string;
  option_text: string;
  is_correct: boolean;
  userSelected: boolean;
}

export interface AdminQuestion {
  question_id: string;
  question_text: string;
  options: AdminOption[];
}

export interface UserExamAttemptWithAnswers {
  attempt_id: string;
  questions: AdminQuestion[];
}
