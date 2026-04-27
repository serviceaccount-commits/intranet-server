import { User } from '../../entities/User.entity';
import { CreateUserInput } from '../../schema/users/CreateUserSchema';
import { FilterUserInput } from '../../schema/users/FilterUserSchema';
import { UpdateUserInput } from '../../schema/users/UpdateUserSchema';
import { CompleteUserProfile } from '../../types/Users.types';
// import { CompleteUserProfile } from '../../types/Users.types';

export interface PaginatedUsersResult {
  users: User[];
  total: number;
}

export interface RankingRow {
  rank: number;
  rankWeight: string;
  name: string;
  QA: string;
  CSAT: string;
  ACW: string;
  AHT_IN: string;
  is_me: boolean;
}

export interface IUserService {
  createUser(userData: CreateUserInput): Promise<User>;
  updateUserLastActivity(userId: string): Promise<void>;
  getUsers(): Promise<User[]>;
  findUsers(filters: FilterUserInput): Promise<PaginatedUsersResult>;
  getUserById(userId: string): Promise<User>;
  getUserProfileById(
    userId: string,
    withNoPhoneNumberCode: boolean,
  ): Promise<CompleteUserProfile>;

  updateUser(userId: string, input: UpdateUserInput): Promise<User>;
  deleteUser(userId: string): Promise<void>;

  getUserPermissions(userId: string): Promise<string[]>;

  getSheetData(userId: string, sheetDataOption: 1 | 2): Promise<RankingRow[]>;
}
