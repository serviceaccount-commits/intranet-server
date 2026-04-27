import { ClassUserValue } from '../../entities/ClassUserValue.entity';
import { Course } from '../../entities/Course.entity';
import { CourseUserValue } from '../../entities/CourseUserValue.entity';
import { TrainingTopic } from '../../entities/TrainingTopic.entity';
import { TrainingTopicUserValue } from '../../entities/TrainingTopicUserValue.entity';
import { CreateCourseInput } from '../../schema/courses/CreateCourseSchema';
import { UpdateCourseInput } from '../../schema/courses/UpdateCourseSchema';
import {
  UserExamWithAnswers,
  UserFacingExam,
} from '../../types/Training.types';

export interface CourseWithProgress {
  course: Course;
  topicValues: TrainingTopicUserValue[];
  completedTopics: number;
  totalTopics: number;
  completionPercentage: number;
}

export interface ClassUserValueWithExamData {
  classUserValue: ClassUserValue;
  examData: UserFacingExam | UserExamWithAnswers | void;
}

export interface TopicWithProgress {
  topic: TrainingTopic;
  classExamValues: ClassUserValueWithExamData[];
  completedClasses: number;
  totalClasses: number;
  completionPercentage: number;
}

export interface ICourseService {
  createCourse(input: CreateCourseInput): Promise<Course>;
  updateCourse(courseId: string, input: UpdateCourseInput): Promise<void>;
  updateCourseTitle(courseId: string, title: string): Promise<void>;
  updateCourseDescription(courseId: string, description: string): Promise<void>;

  getCourses(withUserValues: boolean): Promise<Course[]>;

  getCourseById(courseId: string): Promise<Course>;
  getCourseValues(courseId: string): Promise<CourseUserValue[]>;
  getCoursesWithProgress(userId: string): Promise<CourseWithProgress[]>;
  getCreatedCourses(userId: string): Promise<Course[]>;
  getCourseTopicsWithProgress(
    userId: string,
    courseId: string,
  ): Promise<TopicWithProgress[]>;
}
