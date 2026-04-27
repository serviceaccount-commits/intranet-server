import { User } from '../../entities/User.entity';
import { UserReportsTo } from '../../entities/UserReportsTo.entity';

export interface IUserReportsToService {
  createUserReportsTo(
    reportingUserId: string,
    reportsToUserId: string,
  ): Promise<UserReportsTo>;
  updateUserReportsTo(
    reportingUserId: string,
    newReportsToUserId: string,
  ): Promise<UserReportsTo | null>;
  getLeaders(): Promise<User[]>;
}
