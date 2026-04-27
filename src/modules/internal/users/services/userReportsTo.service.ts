import { inject, injectable } from 'inversify';
import { UserReportsTo } from '../entities/UserReportsTo.entity';
import { AppDataSource } from '../../../../shared/database/data-source';
import { IUserReportsToRepository } from '../interfaces/userReportsTo/userReportsTo.repository.interface';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IUserReportsToService } from '../interfaces/userReportsTo/userReportsTo.service.interface';
import { IUserRepository } from '../interfaces/users/user.repository.interface';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { ConflictError } from '../../../../shared/errors/ConflictError';
import { BusinessLogicError } from '../../../../shared/errors/BusinessLogicError';
import ES from '../../../../shared/types/enum/ES';
import { User } from '../entities/User.entity';

@injectable()
export class UserReportsToService implements IUserReportsToService {
  constructor(
    @inject(TYPES.IUserReportsToRepository)
    private userReportsToRepository: IUserReportsToRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
  ) {}

  async createUserReportsTo(
    reportingUserId: string,
    reportsToUserId: string,
  ): Promise<UserReportsTo> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const reportingUser =
        await this.userRepository.findUserById(reportingUserId);
      const reportsToUser =
        await this.userRepository.findUserById(reportsToUserId);

      if (!reportingUser) {
        throw new NotFoundError('User', reportingUserId);
      }

      if (!reportsToUser) {
        throw new NotFoundError('User', reportsToUserId);
      }

      if (!reportsToUser.selectable_as_leader) {
        throw new BusinessLogicError(
          `User ${reportsToUserId} is not selectable as a leader.`,
        );
      }

      const existingRelationship =
        await this.userReportsToRepository.findUserReportsToRelationship(
          reportingUserId,
          reportsToUserId,
        );

      if (existingRelationship) {
        throw new ConflictError(
          `User ${reportingUserId} already reports to user ${reportsToUserId}.`,
        );
      }

      if (reportingUser.user_id === reportsToUserId) {
        throw new BusinessLogicError(
          `User ${reportingUserId} cannot report to themselves.`,
        );
      }

      const userReportsTo = new UserReportsTo();
      userReportsTo.reportingUser = reportingUser;
      userReportsTo.reporting_user_id = reportingUserId;
      userReportsTo.reportsToUser = reportsToUser;
      userReportsTo.reports_to_user_id = reportsToUserId;

      return await this.userReportsToRepository.create(userReportsTo);
    });
  }

  async updateUserReportsTo(
    reportingUserId: string,
    newReportsToUserId: string,
  ): Promise<UserReportsTo | null> {
    return await AppDataSource.manager.transaction(async (_t) => {
      if (newReportsToUserId === ES.NO_REPORTS_TO) {
        const userReportsToRelation =
          await this.userReportsToRepository.findUserReportsToRelationshipByReportingUserId(
            reportingUserId,
          );

        if (!userReportsToRelation)
          throw new NotFoundError('UserReportsTo', reportingUserId);

        await this.userReportsToRepository.delete(userReportsToRelation);
        return null;
      }

      const newReportsToUser =
        await this.userRepository.findUserById(newReportsToUserId);

      if (!newReportsToUser)
        throw new NotFoundError('User', newReportsToUserId);

      if (!newReportsToUser.selectable_as_leader)
        throw new BusinessLogicError(
          `User ${newReportsToUserId} is not selectable as a leader.`,
        );

      const userReportsToRelation =
        await this.userReportsToRepository.findUserReportsToRelationshipByReportingUserId(
          reportingUserId,
        );

      if (!userReportsToRelation)
        throw new NotFoundError('UserReportsTo', reportingUserId);

      if (reportingUserId === newReportsToUserId)
        throw new BusinessLogicError(
          `User ${reportingUserId} cannot report to themselves.`,
        );

      userReportsToRelation.reports_to_user_id = newReportsToUserId;
      return await this.userReportsToRepository.save(userReportsToRelation);
    });
  }

  async getLeaders(): Promise<User[]> {
    return await this.userReportsToRepository.findAll();
  }
}
