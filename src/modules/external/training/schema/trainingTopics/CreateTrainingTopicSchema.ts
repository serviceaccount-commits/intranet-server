import { z } from 'zod';

export const CreateTrainingTopicSchema = z
  .object({
    topicName: z.string(),
    courseId: z.string().min(1),
  })
  .strict();

export type CreateTrainingTopicInput = z.infer<
  typeof CreateTrainingTopicSchema
>;
