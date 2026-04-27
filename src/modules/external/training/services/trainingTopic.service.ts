import { inject, injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { TYPES } from '../../../../shared/config/containerTypes';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
// import { ConflictError } from '../../../../shared/errors/ConflictError';
import {
  ClassWithUserCompletionStatus,
  ITrainingTopicService,
} from '../interfaces/trainingTopics/trainingTopic.service.interface';
import { ITrainingTopicRepository } from '../interfaces/trainingTopics/trainingTopic.repository.interface';
import { TrainingTopic } from '../entities/TrainingTopic.entity';
import {
  CreateTrainingTopicInput,
  CreateTrainingTopicSchema,
} from '../schema/trainingTopics/CreateTrainingTopicSchema';
import { ICourseRepository } from '../interfaces/courses/course.repository.interface';
import {
  UpdateTrainingTopicInput,
  UpdateTrainingTopicSchema,
} from '../schema/trainingTopics/UpdateTraingTopicSchema';
import { ICourseUserValueRepository } from '../interfaces/courses/courseUserValue.repository.interface';
import { TrainingTopicUserValue } from '../entities/TrainingTopicUserValue.entity';
import { ITrainingTopicUserValueRepository } from '../interfaces/trainingTopics/trainingTopicUserValue.repository.interface';
import { IClassRepository } from '../interfaces/classes/class.repository.interface';
import { IClassUserValueRepository } from '../interfaces/classes/classUserValue.repository.interface';
import ES from '../../../../shared/types/enum/ES';

@injectable()
export class TrainingTopicService implements ITrainingTopicService {
  constructor(
    @inject(TYPES.ICourseRepository)
    private courseRepository: ICourseRepository,
    @inject(TYPES.ITrainingTopicRepository)
    private trainingTopicRepository: ITrainingTopicRepository,
    @inject(TYPES.ICourseUserValueRepository)
    private courseValueRepository: ICourseUserValueRepository,
    @inject(TYPES.ITrainingTopicUserValueRepository)
    private trainingTopicUserValueRepository: ITrainingTopicUserValueRepository,
    @inject(TYPES.IClassRepository)
    private classRepository: IClassRepository,
    @inject(TYPES.IClassUserValueRepository)
    private classUserValueRepository: IClassUserValueRepository,
  ) {}
  async createTopic(input: CreateTrainingTopicInput): Promise<TrainingTopic> {
    const validatedData = CreateTrainingTopicSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      const existingCourse = await this.courseRepository.findById(
        validatedData.courseId,
      );

      if (!existingCourse) {
        throw new NotFoundError('Course', validatedData.courseId);
      }

      existingCourse.updated_at = new Date();
      await this.courseRepository.save(existingCourse);

      // const existingTopic = await this.trainingTopicRepository.findByName(
      //   validatedData.topicName,
      // );

      // if (existingTopic) {
      //   throw new ConflictError(
      //     `Training topic with name ${validatedData.topicName} already exists.`,
      //   );
      // }

      const newTrainingTopic = new TrainingTopic();
      newTrainingTopic.topic_name = validatedData.topicName;
      newTrainingTopic.course = existingCourse;
      newTrainingTopic.course_id = validatedData.courseId;
      newTrainingTopic.topic_status = ES.ACTIVE;

      const trainingTopic =
        await this.trainingTopicRepository.create(newTrainingTopic);

      const courseUserValues = await this.courseValueRepository.findByCourseId(
        validatedData.courseId,
        false,
      );

      const newTrainingTopicUserValues: TrainingTopicUserValue[] = [];
      for (const courseUserValue of courseUserValues) {
        const newTrainingTopicUserValue = new TrainingTopicUserValue();
        newTrainingTopicUserValue.user = courseUserValue.user;
        newTrainingTopicUserValue.user_id = courseUserValue.user_id;
        newTrainingTopicUserValue.topic = trainingTopic;
        newTrainingTopicUserValue.topic_id = trainingTopic.topic_id;
        newTrainingTopicUserValue.courseValue = courseUserValue;
        newTrainingTopicUserValue.course_value_id =
          courseUserValue.course_value_id;
        newTrainingTopicUserValue.completed_classes_count = 0;
        newTrainingTopicUserValue.total_classes_count = 0;
        newTrainingTopicUserValues.push(newTrainingTopicUserValue);
      }

      if (newTrainingTopicUserValues.length > 0) {
        await this.trainingTopicUserValueRepository.saveMany(
          newTrainingTopicUserValues,
        );
      }

      return trainingTopic;
    });
  }

  async updateTopic(
    topicId: string,
    input: UpdateTrainingTopicInput,
  ): Promise<TrainingTopic> {
    const validatedData = UpdateTrainingTopicSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      const trainingTopic =
        await this.trainingTopicRepository.findById(topicId);
      if (!trainingTopic) {
        throw new NotFoundError('Training topic', topicId);
      }

      const course = await this.courseRepository.findById(
        trainingTopic.course_id,
      );
      if (course) {
        course.updated_at = new Date();
        await this.courseRepository.save(course);
      }

      trainingTopic.topic_name = validatedData.topicName;

      if (validatedData.topicStatus) {
        trainingTopic.topic_status = validatedData.topicStatus;
      }
      return await this.trainingTopicRepository.save(trainingTopic);
    });
  }

  async getTopics(courseId: string): Promise<TrainingTopic[]> {
    return await this.trainingTopicRepository.findAll(courseId);
  }

  async getTopicById(topicId: string): Promise<TrainingTopic> {
    const topic = await this.trainingTopicRepository.findById(topicId);
    if (!topic) {
      throw new NotFoundError('Training Topic', topicId);
    }
    return topic;
  }

  async getPublishedClassesWithUserCompletionStatus(
    topicId: string,
    userId: string,
  ): Promise<ClassWithUserCompletionStatus[]> {
    const topic = await this.trainingTopicRepository.findById(topicId);
    if (!topic) {
      throw new NotFoundError('Training topic', topicId);
    }

    // 2 get all PUBLISHED classes for this topic
    const publishedClasses =
      await this.classRepository.findPublishedByTopic(topicId);
    if (publishedClasses.length === 0) return [];

    const publishedClassIds = publishedClasses.map((c) => c.class_id);

    // 3 get the user's completion status for these specific published classes
    const classUserValues =
      await this.classUserValueRepository.findByUserIdAndClassIds(
        userId,
        publishedClassIds,
      );


    // 4 create a map for lookup completion status
    const completionStatusMap = new Map<string, ES.COMPLETED | ES.INCOMPLETE>();
    classUserValues.forEach((clsUserValue) => {
      completionStatusMap.set(
        clsUserValue.class_id,
        clsUserValue.completion_status as ES.COMPLETED | ES.INCOMPLETE,
      );
    });

    // combine class data with user's completion status
    const results: ClassWithUserCompletionStatus[] = publishedClasses.map(
      (cls) => {
        const userStatus = completionStatusMap.get(cls.class_id);
        return {
          class: cls,
          userCompletionStatus: userStatus as ES.COMPLETED | ES.INCOMPLETE,
        };
      },
    );

    return results;
  }
}
