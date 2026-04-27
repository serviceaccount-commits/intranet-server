import { inject, injectable } from 'inversify';
import { IUserExamAttemptService } from '../interfaces/userExamAttempts/userExamAttempt.service.interface';
import {
  CreateUserExamAttemptInput,
  CreateUserExamAttemptSchema,
} from '../schema/userExamAttempts/CreateUserExamAttemptSchema';
import { UserExamAttempt } from '../entities/UserExamAttempts.entity';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IUserExamAttemptRepository } from '../interfaces/userExamAttempts/userExamAttempt.repository.interface';
import { AppDataSource } from '../../../../shared/database/data-source';
import { IExamRepository } from '../interfaces/exams/exam.repository.interface';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { IClassUserValueRepository } from '../interfaces/classes/classUserValue.repository.interface';
import ES from '../../../../shared/types/enum/ES';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import { IQuestionRepository } from '../interfaces/questions/question.repository.interface';
import { UserAnswer } from '../entities/UserAnswers.entity';
import { IUserAnswerRepository } from '../interfaces/userAnswers/userAnswer.repository.interface';
import { IClassService } from '../interfaces/classes/class.service.interface';
import {
  AdminQuestion,
  UserExamAttemptWithAnswers,
} from '../types/Training.types';

@injectable()
export class UserExamAttemptService implements IUserExamAttemptService {
  constructor(
    @inject(TYPES.IUserExamAttemptRepository)
    private userExamAttemptRepository: IUserExamAttemptRepository,
    @inject(TYPES.IUserAnswerRepository)
    private userAnswerRepository: IUserAnswerRepository,
    @inject(TYPES.IExamRepository)
    private examRepository: IExamRepository,
    @inject(TYPES.IQuestionRepository)
    private questionRepository: IQuestionRepository,
    @inject(TYPES.IClassUserValueRepository)
    private classUserValueRepository: IClassUserValueRepository,
    @inject(TYPES.IClassService)
    private classService: IClassService,
  ) {}

  async submitExamAnswers(
    input: CreateUserExamAttemptInput,
    userId: string,
  ): Promise<UserExamAttempt> {
    const validatedData = CreateUserExamAttemptSchema.parse(input);

    return await AppDataSource.manager.transaction(async (_t) => {
      const exam = await this.examRepository.findById(
        validatedData.examId,
        true,
      );
      if (!exam) {
        throw new NotFoundError('Exam not found', validatedData.examId);
      }

      if (exam.exam_status !== ES.PUBLISHED) {
        throw new BusinessLogicError('Exam is not published');
      }

      const classUserValue =
        await this.classUserValueRepository.findByClassIdAndUserId(
          exam.class_id,
          userId,
        );


      const userExamAttempts =
        await this.userExamAttemptRepository.findByUserIdAndExamId(
          userId,
          validatedData.examId,
        );


      if (!classUserValue) {
        throw new BusinessLogicError('Class not assigned to user');
      }

      let validAttempts: UserExamAttempt[] = [];

      if (userExamAttempts.length > 0) {
        validAttempts = userExamAttempts.filter((attempt) => attempt.isValid);

        if (validAttempts.length === exam.max_attempts) {
          throw new BusinessLogicError('Max attempts reached');
        }
        if (
          validAttempts.findIndex((attempt) => attempt.status === ES.PASSED) !==
          -1
        ) {
          throw new BusinessLogicError('Exam already passed');
        }
        if (classUserValue?.completion_status === ES.COMPLETED) {
          throw new BusinessLogicError('Class already completed');
        }
      }

      const examQuestions = await this.questionRepository.findAllByExamId(
        validatedData.examId,
        true,
      );

      if (!examQuestions) {
        throw new NotFoundError('Questions not found', validatedData.examId);
      }

      if (examQuestions.length !== validatedData.answers.length) {
        throw new BusinessLogicError('Invalid number of answers');
      }
      // IS A VALID EXAM RETRY
      const answerMap = new Map(
        validatedData.answers.map((answer) => [
          answer.questionId,
          new Set(answer.optionId),
        ]),
      );

      let userCorrectQuestionCount = 0;
      for (const question of examQuestions) {
        if (!question.options) continue;

        const correctOptionIds = new Set(
          question.options
            .filter((opt) => opt.is_correct)
            .map((opt) => opt.option_id),
        );

        // Instant lookup instead of .find()
        const userAnswerOptionIds =
          answerMap.get(question.question_id) || new Set();

        let isQuestionCorrect = true;

        // Check if user selected all correct options
        for (const correctId of correctOptionIds) {
          if (!userAnswerOptionIds.has(correctId)) {
            isQuestionCorrect = false;
            break;
          }
        }

        // Check if user selected any incorrect options
        if (
          isQuestionCorrect &&
          userAnswerOptionIds.size > correctOptionIds.size
        ) {
          isQuestionCorrect = false;
        }

        if (isQuestionCorrect) {
          userCorrectQuestionCount++;
        }
      }
      const score = (userCorrectQuestionCount / examQuestions.length) * 100;
      const userExamAttempt = new UserExamAttempt();
      userExamAttempt.exam = exam;
      userExamAttempt.exam_id = exam.exam_id;
      userExamAttempt.user = classUserValue.user;
      userExamAttempt.user_id = classUserValue.user_id;
      userExamAttempt.score = score;

      if (score >= exam.passing_score) {
        userExamAttempt.status = ES.PASSED;
        await this.classService.updateClassUserValue(
          exam.class_id,
          userId,
          ES.COMPLETED,
        );
      } else {
        userExamAttempt.status = ES.FAILED;
      }

      const attempt =
        await this.userExamAttemptRepository.create(userExamAttempt);

      for (const answer of validatedData.answers) {
        for (const optionId of answer.optionId) {
          const newUserAnswer = new UserAnswer();
          newUserAnswer.attempt = attempt;
          newUserAnswer.attempt_id = attempt.attempt_id;
          newUserAnswer.question_id = answer.questionId;
          newUserAnswer.option_id = optionId;
          await this.userAnswerRepository.create(newUserAnswer);
        }
      }

      return attempt;
    });
  }

  async getUserExamAnswers(
    attemptId: string,
  ): Promise<UserExamAttemptWithAnswers> {
    const userExamAttempt =
      await this.userExamAttemptRepository.findById(attemptId);

    const exam = userExamAttempt?.exam;
    if (!exam) {
      throw new NotFoundError('Exam not found', attemptId);
    }

    const questions = await this.questionRepository.findAllByExamId(
      exam.exam_id,
      true,
    );

    if (!questions) {
      throw new NotFoundError('Questions not found', attemptId);
    }

    const answers = await this.userAnswerRepository.findByAttemptId(attemptId);

    if (!answers) {
      throw new NotFoundError('Answers not found', attemptId);
    }
    const returnQuestions: AdminQuestion[] = [];

    for (const question of questions) {
      if (!question.options) continue;

      const resultQuestion: AdminQuestion = {
        question_id: question.question_id,
        question_text: question.question_text,
        options: [],
      };

      for (const option of question.options) {
        if (!question.options) continue;

        resultQuestion.options.push({
          option_id: option.option_id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          userSelected: answers.some((answer) => {
            return (
              answer.question_id === question.question_id &&
              answer.option_id === option.option_id
            );
          }),
        });
      }
      returnQuestions.push(resultQuestion);
    }

    return {
      attempt_id: userExamAttempt.attempt_id,
      questions: returnQuestions,
    };
  }
}
