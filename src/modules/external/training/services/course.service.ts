import { inject, injectable } from 'inversify';
import {
  ClassUserValueWithExamData,
  CourseWithProgress,
  ICourseService,
  TopicWithProgress,
} from '../interfaces/courses/course.service.interface';

import { AppDataSource } from '../../../../shared/database/data-source';
import { TYPES } from '../../../../shared/config/containerTypes';

import { IUserRepository } from '../../../internal/users/interfaces/users/user.repository.interface';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { Course } from '../entities/Course.entity';
import {
  CreateCourseInput,
  CreateCourseSchema,
} from '../schema/courses/CreateCourseSchema';
import { ICourseRepository } from '../interfaces/courses/course.repository.interface';
import {
  UpdateCourseInput,
  UpdateCourseSchema,
} from '../schema/courses/UpdateCourseSchema';
import { CourseUserValue } from '../entities/CourseUserValue.entity';
import ES from '../../../../shared/types/enum/ES';
import { ICourseUserValueRepository } from '../interfaces/courses/courseUserValue.repository.interface';
import { User } from '../../../internal/users/entities/User.entity';
import { ITrainingTopicUserValueRepository } from '../interfaces/trainingTopics/trainingTopicUserValue.repository.interface';
import { ITrainingTopicRepository } from '../interfaces/trainingTopics/trainingTopic.repository.interface';
import { TrainingTopicUserValue } from '../entities/TrainingTopicUserValue.entity';
import { ClassUserValue } from '../entities/ClassUserValue.entity';
import { TrainingTopic } from '../entities/TrainingTopic.entity';
import { Class } from '../entities/Class.entity';
import { IClassRepository } from '../interfaces/classes/class.repository.interface';
import { IClassUserValueRepository } from '../interfaces/classes/classUserValue.repository.interface';
import { IExamStudentService } from '../interfaces/exams/exam-student.service.interface';

@injectable()
export class CourseService implements ICourseService {
  constructor(
    @inject(TYPES.ICourseRepository)
    private courseRepository: ICourseRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.ICourseUserValueRepository)
    private courseValueRepository: ICourseUserValueRepository,
    @inject(TYPES.ITrainingTopicUserValueRepository)
    private trainingTopicValueRepository: ITrainingTopicUserValueRepository,
    @inject(TYPES.ITrainingTopicRepository)
    private trainingTopicRepository: ITrainingTopicRepository,
    @inject(TYPES.IClassRepository)
    private classRepository: IClassRepository,
    @inject(TYPES.IClassUserValueRepository)
    private classValueRepository: IClassUserValueRepository,
    @inject(TYPES.IExamStudentService)
    private examStudentService: IExamStudentService,
  ) {}

  async createCourse(input: CreateCourseInput): Promise<Course> {
    const validatedData = CreateCourseSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      // const existingCourse = await this.courseRepository.findByName(
      //   validatedData.courseName,
      // );

      // if (existingCourse) {
      //   throw new ConflictError(
      //     `Course with name ${validatedData.courseName} already exists.`,
      //   );
      // }

      const user = await this.userRepository.findUserById(validatedData.userId);

      if (!user) {
        throw new NotFoundError('User', validatedData.userId);
      }

      const newCourse = new Course();
      newCourse.course_name = validatedData.courseName;
      newCourse.course_description = validatedData.courseDescription;
      newCourse.course_status = validatedData.status;
      newCourse.user = user;
      newCourse.user_id = user.user_id;

      const course = await this.courseRepository.create(newCourse);

      if (validatedData.userIds) {
        const users = await this.userRepository.findUserByIds(
          validatedData.userIds,
        );
        for (const user of users) {
          const newCourseUserValue = new CourseUserValue();
          newCourseUserValue.user = user;
          newCourseUserValue.user_id = user.user_id;
          newCourseUserValue.course = course;
          newCourseUserValue.course_id = course.course_id;
          newCourseUserValue.user_availability_status = ES.ACTIVE;
          await this.courseValueRepository.save(newCourseUserValue);
        }
      }

      return course;
    });
  }

  async updateCourse(
    courseId: string,
    input: UpdateCourseInput,
  ): Promise<void> {
    const validatedData = UpdateCourseSchema.parse(input);
    const newUserIds = validatedData.userIds;

    return await AppDataSource.manager.transaction(async (_t) => {
      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new NotFoundError('Course', courseId);
      }
      course.course_name = validatedData.courseName;
      course.course_description = validatedData.courseDescription;
      course.course_status = validatedData.status;
      course.updated_at = new Date();

      let usersToGrantAccess: User[] = [];
      if (newUserIds.length > 0) {
        usersToGrantAccess =
          await this.userRepository.findUserByIds(newUserIds);
        if (usersToGrantAccess.length !== newUserIds.length) {
          throw new NotFoundError('User(s)');
        }
      }
      // 2 USERS TO GRANT ACCESS

      // fetch all existing CourseUserValue records for this course
      const currentCourseValues =
        await this.courseValueRepository.findByCourseId(
          course.course_id,
          false,
        );

      // 3 COURSE_USER_VALUE

      // map currnt records for lookup
      const currentCourseValuesMap = new Map<string, CourseUserValue>();
      currentCourseValues.forEach((value) =>
        currentCourseValuesMap.set(value.user_id, value),
      );
      // USER ID -> HIS COURSE_USER_VALUE

      const courseValuesToSave: CourseUserValue[] = [];
      const trainingTopicValuesToSave: TrainingTopicUserValue[] = [];
      const classUserValuesToSave: ClassUserValue[] = [];
      const newUserIdSet = new Set(newUserIds);

      // process exisiting records: Deactivate those no longer in the new list
      for (const currentValue of currentCourseValues) {
        if (
          currentValue.user_availability_status === ES.ACTIVE &&
          !newUserIdSet.has(currentValue.user_id)
        ) {
          currentValue.user_availability_status = ES.INACTIVE;
          courseValuesToSave.push(currentValue);
        } else if (
          currentValue.user_availability_status === ES.INACTIVE &&
          newUserIdSet.has(currentValue.user_id)
        ) {
          currentValue.user_availability_status = ES.ACTIVE;
          courseValuesToSave.push(currentValue);
        }
      }

      // identify purely new users and fetch course structure
      const purelyNewUserIds = newUserIds.filter(
        (id) => !currentCourseValuesMap.has(id),
      );
      let trainingTopics: TrainingTopic[] = [];
      let classesByTopicId = new Map<string, Class[]>();
      if (purelyNewUserIds.length > 0) {
        {
          trainingTopics =
            await this.trainingTopicRepository.findByCourseId(courseId);
          if (trainingTopics.length > 0) {
            const topicIds = trainingTopics.map((t) => t.topic_id);
            classesByTopicId =
              await this.classRepository.findClassesGroupedByTopic(topicIds);
          }
        }

        // process new users (create full progress structure)
        for (const userId of purelyNewUserIds) {
          const user = usersToGrantAccess.find((u) => u.user_id === userId);
          if (!user) continue;

          // a) create CourseUserValue for the user
          const newCourseUserValue = new CourseUserValue();
          newCourseUserValue.user = user;
          newCourseUserValue.user_id = user.user_id;
          newCourseUserValue.course = course;
          newCourseUserValue.course_id = course.course_id;
          newCourseUserValue.user_availability_status = ES.ACTIVE;
          courseValuesToSave.push(newCourseUserValue);

          // b) create TrainingTopicUserValue and ClassUserValue for the user
          for (const trainingTopic of trainingTopics) {
            const classesForThisTopic =
              classesByTopicId.get(trainingTopic.topic_id) || [];
            const totalClassesCount = classesForThisTopic.length;

            const newTrainingTopicUserValue = new TrainingTopicUserValue();
            newTrainingTopicUserValue.user = user;
            newTrainingTopicUserValue.user_id = user.user_id;
            newTrainingTopicUserValue.topic = trainingTopic;
            newTrainingTopicUserValue.topic_id = trainingTopic.topic_id;
            newTrainingTopicUserValue.courseValue = newCourseUserValue;
            newTrainingTopicUserValue.course_value_id =
              newCourseUserValue.course_value_id;
            newTrainingTopicUserValue.completed_classes_count = 0;
            newTrainingTopicUserValue.total_classes_count = totalClassesCount;
            trainingTopicValuesToSave.push(newTrainingTopicUserValue);

            for (const cls of classesForThisTopic) {
              const classUserValue = new ClassUserValue();
              classUserValue.user = user;
              classUserValue.user_id = user.user_id;
              classUserValue.topicValue = newTrainingTopicUserValue;
              classUserValue.topic_value_id =
                newTrainingTopicUserValue.topic_value_id;
              classUserValue.class = cls;
              classUserValue.class_id = cls.class_id;
              classUserValue.completion_status = ES.INCOMPLETE;
              classUserValuesToSave.push(classUserValue);
            }
          }
        }
      }
      if (courseValuesToSave.length > 0) {
        await this.courseValueRepository.saveMany(courseValuesToSave);
      }
      if (trainingTopicValuesToSave.length > 0) {
        await this.trainingTopicValueRepository.saveMany(
          trainingTopicValuesToSave,
        );
      }
      if (classUserValuesToSave.length > 0) {
        await this.classValueRepository.saveMany(classUserValuesToSave);
      }

      await this.courseRepository.save(course);
    });
  }

  async updateCourseTitle(courseId: string, title: string): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course', courseId);
    }
    course.course_name = title;
    await this.courseRepository.save(course);
  }

  async updateCourseDescription(
    courseId: string,
    description: string,
  ): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course', courseId);
    }
    course.course_description = description;
    await this.courseRepository.save(course);
  }

  async getCourses(withUserValues: boolean = false): Promise<Course[]> {
    return await this.courseRepository.findAll(withUserValues);
  }

  async getCourseById(courseId: string): Promise<Course> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course', courseId);
    }
    return course;
  }

  async getCourseValues(courseId: string): Promise<CourseUserValue[]> {
    return await this.courseValueRepository.findByCourseId(courseId, true);
  }

  async getCoursesWithProgress(userId: string): Promise<CourseWithProgress[]> {
    const courseUserValues =
      await this.courseValueRepository.findByUserId(userId);
    if (!courseUserValues || courseUserValues.length === 0) {
      return [];
    }
    const courseIds = courseUserValues.map((cuv) => cuv.course_id);

    // 2 get all ACTIVE topics for these specific courses
    const topicsByCourse =
      await this.trainingTopicRepository.findActiveTopicsGroupedByCourse(
        courseIds,
      );


    // 3 get all trainingTopicUserValue progress records for this user and these courses
    const trainingTopicUserValues =
      await this.trainingTopicValueRepository.findByUserIdAndCourseIds(
        userId,
        courseIds,
      );

    // 4 map trainingTopicUserValue progress
    const trainingTopicUserValueProgressMap = new Map<
      string,
      { completed: number; total: number }
    >();
    trainingTopicUserValues.forEach((tuv) => {
      trainingTopicUserValueProgressMap.set(tuv.topic_id, {
        completed: tuv.completed_classes_count,
        total: tuv.total_classes_count,
      });
    });

    // 5 calculate progress for each course
    const results: CourseWithProgress[] = [];
    for (const cuv of courseUserValues) {
      const course = cuv.course;
      const courseId = course.course_id;
      const totalTopics = topicsByCourse.get(courseId)?.length || 0;
      let completedTopics = 0;
      if (totalTopics > 0) {
        const topicsInThisCourse = topicsByCourse.get(courseId) || [];
        for (const topic of topicsInThisCourse) {
          const progress = trainingTopicUserValueProgressMap.get(
            topic.topic_id,
          );
          if (
            progress &&
            progress.total > 0 &&
            progress.completed === progress.total
          ) {
            completedTopics++;
          }
        }
      }

      const completionPercentage =
        totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      results.push({
        course: course,
        topicValues: cuv.topicValues,
        completedTopics: completedTopics,
        totalTopics: totalTopics,
        completionPercentage: completionPercentage,
      });
    }

    return results;
  }

  async getCreatedCourses(userId: string): Promise<Course[]> {
    const courses = await this.courseRepository.findAllByAuthorId(userId);

    return courses;
  }

  async getCourseTopicsWithProgress(
    userId: string,
    courseId: string,
  ): Promise<TopicWithProgress[]> {
    const courseUserValue =
      await this.courseValueRepository.findByCourseIdAndUserId(
        courseId,
        userId,
      );

    if (
      !courseUserValue ||
      courseUserValue.user_availability_status !== ES.ACTIVE
    ) {
      throw new NotFoundError('Course', courseId);
    }

    // get all topicUserValue records for this user and course
    const trainingTopicUserValues =
      await this.trainingTopicValueRepository.findByUserIdAndCourseIdWithTopic(
        userId,
        courseId,
      );

    // 3 map to the desired output format
    const results: TopicWithProgress[] = await Promise.all(
      trainingTopicUserValues.map(async (tuv) => {
        const totalClasses = tuv.total_classes_count || 0;
        const completedClasses = tuv.completed_classes_count || 0;
        const completionPercentage =
          totalClasses > 0
            ? Math.round((completedClasses / totalClasses) * 100)
            : 0;

        const classExamValues: ClassUserValueWithExamData[] = await Promise.all(
          tuv.classValues.map(async (cuv) => {
            const examData = await this.examStudentService.getUserExamNoAttemptLimit(
              cuv.class.class_id,
              userId,
            );

            return {
              classUserValue: cuv,
              examData: examData,
            };
          }),
        );

        return {
          topic: tuv.topic,
          classExamValues: classExamValues,
          completedClasses: completedClasses,
          totalClasses: totalClasses,
          completionPercentage: completionPercentage,
        };
      }),
    );
    return results;
  }
}
