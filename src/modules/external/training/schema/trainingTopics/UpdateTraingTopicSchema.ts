import { z } from 'zod';
import ES from '../../../../../shared/types/enum/ES';

export const UpdateTrainingTopicSchema = z
  .object({
    topicName: z.string().min(1),
    topicStatus: z
      .enum([ES.ACTIVE, ES.INACTIVE, ES.PUBLISHED, ES.DRAFT, ES.ARCHIVED])
      .optional(),
  })
  .strict();

export type UpdateTrainingTopicInput = z.infer<
  typeof UpdateTrainingTopicSchema
>;
