import { User } from '../../entities/User.entity';
import { UserDetails } from '../../entities/UserDetail.entity';
import { UserReportsTo } from '../../entities/UserReportsTo.entity';
import { FilterPostUserInput } from '../../schema/users/FilterPostUserSchema';
import { FilterUserInput } from '../../schema/users/FilterUserSchema';
import { PaginatedUsersResult } from './user.service.interface';

export interface IUserRepository {
  createUser(user: User): Promise<User>;
  updateUserLastActivity(userId: string): Promise<void>;
  findAllUsers(): Promise<User[]>;
  findAndCountUsers(filters: FilterUserInput): Promise<PaginatedUsersResult>;
  findAndCountPostUsers(
    filters: FilterPostUserInput,
  ): Promise<PaginatedUsersResult>;
  findUserById(id: string): Promise<User | null>;
  findUserByIdWithPermissions(id: string): Promise<User | null>;

  findUserProfileById(userId: string): Promise<User | null>;

  findUserReportsToRelationships(userId: string): Promise<UserReportsTo[]>;

  findUserByIds(ids: string[]): Promise<User[]>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByPhone(phone: string): Promise<User | null>;
  deleteUser(user: User): Promise<void>;
  saveUser(user: User): Promise<User>;

  createUserDetails(userDetails: UserDetails): Promise<UserDetails>;
  saveUserDetails(userDetails: UserDetails): Promise<UserDetails>;
  findUserByPersonalEmail(email: string): Promise<UserDetails | null>;
  findUserByPersonalPhone(phone: string): Promise<UserDetails | null>;
  findUserByEmergencyContactPhone(phone: string): Promise<UserDetails | null>;

  findUserReportsToRelationship(
    reportingUserId: string,
    reportsToUserId: string,
  ): Promise<UserReportsTo | null>;
  createUserReportsTo(userReportsTo: UserReportsTo): Promise<UserReportsTo>;

  findUserWithPermissions(userId: string): Promise<User | null>;
}
