import { User } from '../../entities/User.entity';
import { UserReportsTo } from '../../entities/UserReportsTo.entity';

export interface IUserReportsToRepository {
  create(report: UserReportsTo): Promise<UserReportsTo>;
  findUserReportsToRelationship(
    reportingUserId: string,
    reportsToUserId: string,
  ): Promise<UserReportsTo | null>;
  findUserReportsToRelationshipByReportingUserId(
    reportingUserId: string,
  ): Promise<UserReportsTo | null>;
  save(userReportsTo: UserReportsTo): Promise<UserReportsTo>;
  delete(userReportsTo: UserReportsTo): Promise<void>;
  findAll(): Promise<User[]>;
}
