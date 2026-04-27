import { z } from 'zod';

export const CreateUserExamAttemptSchema = z
  .object({
    examId: z.string().min(1),
    answers: z.array(
      z.object({
        questionId: z.string().min(1),
        optionId: z.array(z.string().min(1)),
      }),
    ),
  })
  .strict();

export type CreateUserExamAttemptInput = z.infer<
  typeof CreateUserExamAttemptSchema
>;
