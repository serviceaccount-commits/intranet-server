import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { ITopicService } from '../interfaces/topics/topic.service.interface';
import { ITopicRepository } from '../interfaces/topics/topic.repository.interface';
import { IClientRepository } from '../interfaces/clients/client.repository.interface';
import { IUserRepository } from '../../../internal/users/interfaces/users/user.repository.interface';
import { KbTopic } from '../database/kb-domain.types';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError';
import { CreateTopicInput, CreateTopicSchema } from '../schema/topics/CreateTopicSchema';
import { UpdateTopicInput, UpdateTopicSchema } from '../schema/topics/UpdateTopicSchema';

@injectable()
export class TopicService implements ITopicService {
  constructor(
    @inject(TYPES.ITopicRepository)
    private topicRepository: ITopicRepository,
    @inject(TYPES.IClientRepository)
    private clientRepository: IClientRepository,
    @inject(TYPES.IUserRepository)
    private userRepository: IUserRepository,
  ) {}

  async createTopic(input: CreateTopicInput): Promise<KbTopic> {
    const data = CreateTopicSchema.parse(input);

    if (!data.userId) throw new AuthenticationError('User not authenticated.');

    const user = await this.userRepository.findUserById(data.userId);
    if (!user) throw new NotFoundError('User', data.userId);

    const client = await this.clientRepository.findById(data.clientId);
    if (!client) throw new NotFoundError('Client', data.clientId);

    return this.topicRepository.create({
      topic_name: data.topicName,
      topic_edit_available: true,
      client_id: client.client_id,
      user_id: data.userId,
    });
  }

  async updateTopic(input: UpdateTopicInput): Promise<KbTopic> {
    const data = UpdateTopicSchema.parse(input);

    const topic = await this.topicRepository.findById(data.topicId);
    if (!topic) throw new NotFoundError('Topic', data.topicId);

    topic.topic_name = data.topicName;
    return this.topicRepository.save(topic);
  }

  async getTopics(clientId: string): Promise<KbTopic[]> {
    return this.topicRepository.findAllByClientId(clientId);
  }

  async getTopicById(topicId: string): Promise<KbTopic> {
    const topic = await this.topicRepository.findById(topicId);
    if (!topic) throw new NotFoundError('Topic', topicId);
    return topic;
  }
}
