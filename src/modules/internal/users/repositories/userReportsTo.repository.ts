import { injectable } from 'inversify';
import { AppDataSource } from '../../../../shared/database/data-source';
import { UserReportsTo } from '../entities/UserReportsTo.entity';
import { IUserReportsToRepository } from '../interfaces/userReportsTo/userReportsTo.repository.interface';
import { User } from '../entities/User.entity';
import ES from '../../../../shared/types/enum/ES';

@injectable()
export class UserReportsToRepository implements IUserReportsToRepository {
  async create(report: UserReportsTo): Promise<UserReportsTo> {
    return await AppDataSource.manager.save(report);
  }

  async findUserReportsToRelationship(
    reportingUserId: string,
    reportsToUserId: string,
  ): Promise<UserReportsTo | null> {
    return await AppDataSource.manager.findOne(UserReportsTo, {
      where: {
        reporting_user_id: reportingUserId,
        reports_to_user_id: reportsToUserId,
      },
    });
  }

  async findUserReportsToRelationshipByReportingUserId(
    reportingUserId: string,
  ): Promise<UserReportsTo | null> {
    return await AppDataSource.manager.findOne(UserReportsTo, {
      where: {
        reporting_user_id: reportingUserId,
      },
    });
  }

  async save(userReportsTo: UserReportsTo): Promise<UserReportsTo> {
    return await AppDataSource.manager.save(userReportsTo);
  }

  async delete(userReportsTo: UserReportsTo): Promise<void> {
    await AppDataSource.manager.remove(userReportsTo);
  }

  async findAll(): Promise<User[]> {
    return await AppDataSource.manager.find(User, {
      where: {
        selectable_as_leader: true,
        status: ES.ACTIVE,
      },
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
      },
    });
  }
}
