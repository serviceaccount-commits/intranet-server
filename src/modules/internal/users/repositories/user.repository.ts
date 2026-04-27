import { Brackets, In } from 'typeorm';
import { AppDataSource } from '../../../../shared/database/data-source';
import { User } from '../entities/User.entity';
import { UserDetails } from '../entities/UserDetail.entity';
import { UserReportsTo } from '../entities/UserReportsTo.entity';
import { IUserRepository } from '../interfaces/users/user.repository.interface';
import { PaginatedUsersResult } from '../interfaces/users/user.service.interface';
import { FilterUserInput } from '../schema/users/FilterUserSchema';
import { FilterPostUserInput } from '../schema/users/FilterPostUserSchema';

export class UserRepository implements IUserRepository {
  async createUser(user: User): Promise<User> {
    return await AppDataSource.manager.save(user);
  }

  async updateUserLastActivity(userId: string): Promise<void> {
    await AppDataSource.manager.update(User, userId, {
      last_activity_at: new Date(),
    });
  }

  async findAllUsers(): Promise<User[]> {
    return await AppDataSource.manager.find(User);
  }

  async findAndCountUsers(
    filters: FilterUserInput,
  ): Promise<PaginatedUsersResult> {
    const {
      page,
      limit,
      status,
      selectableAsLeader,
      search,
      roleId,
      clientId,
      assignmentId,
      reportsToId,
    } = filters;

    const queryBuilder = AppDataSource.manager
      .createQueryBuilder(User, 'user')
      .select([
        'user.user_id',
        'user.first_name',
        'user.last_name',
        'user.work_email',
        'user.work_phone',
        'user.selectable_as_leader',
        'user.job_title',
        'user.status',
        'user.last_activity_at',
        'role.role_id',
        'role.role_name',
        'userDetails.residential_country',
        'client.client_id',
        'client.client_name',
        'assignment.assignment_id',
        'assignment.assignment_name',
        'reportsToRel.reports_to_user_id',
        'reportsToUser.user_id',
        'reportsToUser.first_name',
        'reportsToUser.last_name',
      ])
      .leftJoin('user.role', 'role')
      .leftJoin('user.userDetails', 'userDetails')
      .leftJoin('user.clients', 'client')
      .leftJoin('user.assignments', 'assignment')
      .leftJoin('user.reportingTo', 'reportsToRel')
      .leftJoin('reportsToRel.reportsToUser', 'reportsToUser');

    if (status !== undefined) {
      const stat = status[0]?.split(',');

      if (stat && stat.length > 1) {
        queryBuilder.andWhere('user.status IN (...stat)', {
          stat: stat,
        });
      } else if (stat && stat.length === 1) {
        queryBuilder.andWhere('user.status = :status', {
          status: stat[0],
        });
      }
    }
    if (selectableAsLeader !== undefined) {
      queryBuilder.andWhere('user.selectable_as_leader = :selectableAsLeader', {
        selectableAsLeader,
      });
    }
    if (search !== undefined && search.length > 0) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.first_name ILIKE :searchName', {
            searchName: `%${search}%`,
          })
            .orWhere('user.last_name ILIKE :searchName', {
              searchName: `%${search}%`,
            })
            .orWhere('user.work_email ILIKE :searchName', {
              searchName: `%${search}%`,
            });
        }),
      );
    }
    if (roleId !== undefined) {
      queryBuilder.andWhere('user.role_id IN (:...roleIds)', {
        roleIds: roleId[0]?.split(','),
      });
    }
    if (clientId !== undefined && clientId.length > 0) {
      queryBuilder.andWhere('client.client_id IN (:...clientIds)', {
        clientIds: clientId[0]?.split(','),
      });
    }
    if (assignmentId !== undefined && assignmentId.length > 0) {
      queryBuilder.andWhere('assignment.assignment_id IN (:...assignmentIds)', {
        assignmentIds: assignmentId[0]?.split(','),
      });
    }
    if (reportsToId !== undefined && reportsToId.length > 0) {
      queryBuilder.andWhere(
        'reportsToRel.reports_to_user_id IN (:...reportsToIds)',
        {
          reportsToIds: reportsToId[0]?.split(','),
        },
      );
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [users, total] = await queryBuilder
      .orderBy('user.first_name', 'ASC')
      .addOrderBy('user.last_name', 'ASC')
      .getManyAndCount();

    return { users, total };
  }

  async findUserReportsToRelationships(
    userId: string,
  ): Promise<UserReportsTo[]> {
    return await AppDataSource.manager.find(UserReportsTo, {
      where: {
        reports_to_user_id: userId,
      },
    });
  }

  async findAndCountPostUsers(
    filters: FilterPostUserInput,
  ): Promise<PaginatedUsersResult> {
    const {
      page,
      limit,
      status,
      selectableAsLeader,
      roleId,
      clientIds,
      assignmentIds,
      reportsToId,
    } = filters;

    const queryBuilder = AppDataSource.manager
      .createQueryBuilder(User, 'user')
      .select([
        'user.user_id',
        'user.first_name',
        'user.last_name',
        'user.work_email',
        'user.work_phone',
        'user.selectable_as_leader',
        'user.job_title',
        'user.status',
        'role.role_id',
        'role.role_name',
        'userDetails.residential_country',
        'client.client_id',
        'client.client_name',
        'assignment.assignment_id',
        'assignment.assignment_name',
        'reportsToRel.reports_to_user_id',
      ])
      .leftJoin('user.role', 'role')
      .leftJoin('user.userDetails', 'userDetails')
      .leftJoin('user.clients', 'client')
      .leftJoin('user.assignments', 'assignment')
      .leftJoin('user.reportingTo', 'reportsToRel');

    if (status !== undefined) {
      queryBuilder.andWhere('user.status = :status', { status });
    }
    if (selectableAsLeader !== undefined) {
      queryBuilder.andWhere('user.selectable_as_leader = :selectableAsLeader', {
        selectableAsLeader,
      });
    }
    if (roleId !== undefined) {
      queryBuilder.andWhere('user.role_id = :roleId', { roleId });
    }
    if (clientIds !== undefined && clientIds.length > 0) {
      queryBuilder.andWhere('client.client_id IN (:...clientIds)', {
        clientIds: clientIds,
      });
    }
    if (assignmentIds !== undefined && assignmentIds.length > 0) {
      queryBuilder
        .innerJoin('user.assignments', 'assignment')
        .andWhere('assignment.assignment_id IN (:...assignmentIds)', {
          assignmentIds: assignmentIds,
        });
    }
    if (reportsToId !== undefined) {
      queryBuilder
        .innerJoin('user.reportingTo', 'reportsToRel')
        .andWhere('reportsToRel.reports_to_user_id : :reportsToId', {
          reportsToId,
        });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return { users, total };
  }

  async findUserProfileById(userId: string): Promise<User | null> {
    const queryBuilder = AppDataSource.manager
      .createQueryBuilder(User, 'user')
      .select([
        'user.user_id',
        'user.first_name',
        'user.last_name',
        'user.work_email',
        'user.work_phone',
        'user.job_title',
        'user.selectable_as_leader',
        'user.last_activity_at',
      ])

      .leftJoinAndSelect('user.userDetails', 'userDetails')

      .leftJoinAndSelect('user.role', 'role')

      .leftJoinAndSelect('user.reportingTo', 'reportsToRel')
      .leftJoinAndSelect('reportsToRel.reportsToUser', 'reportsTo')

      .leftJoinAndSelect('user.clients', 'client')

      .leftJoinAndSelect('user.assignments', 'assignment')
      .where('user.user_id = :userId', { userId });

    const users = await queryBuilder.getOne();

    return users;
  }

  async findUserById(id: string): Promise<User | null> {
    return await AppDataSource.manager.findOne(User, {
      where: {
        user_id: id,
      },
      relations: {
        userDetails: true,
        role: true,
        clients: true,
      },
    });
  }

  async findUserByIdWithPermissions(id: string): Promise<User | null> {
    return await AppDataSource.manager.findOne(User, {
      where: {
        user_id: id,
      },
      relations: {
        userDetails: true,
        role: { permissions: true },
        clients: true,
      },
    });
  }

  async findUserByIds(ids: string[]): Promise<User[]> {
    if (!ids || ids.length === 0) return [];
    return await AppDataSource.manager.find(User, {
      where: {
        user_id: In(ids),
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await AppDataSource.manager.findOne(User, {
      where: {
        work_email: email,
      },
      relations: {
        role: { permissions: true },
      },
    });
  }

  async findUserByPersonalEmail(email: string): Promise<UserDetails | null> {
    return await AppDataSource.manager.findOne(UserDetails, {
      where: {
        personal_email: email,
      },
    });
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return await AppDataSource.manager.findOne(User, {
      where: [{ work_phone: phone }],
    });
  }

  async findUserByPersonalPhone(phone: string): Promise<UserDetails | null> {
    return await AppDataSource.manager.findOne(UserDetails, {
      where: {
        personal_phone: phone,
      },
    });
  }

  async findUserByEmergencyContactPhone(
    phone: string,
  ): Promise<UserDetails | null> {
    return await AppDataSource.manager.findOne(UserDetails, {
      where: {
        emergency_contact_phone: phone,
      },
    });
  }

  async deleteUser(user: User): Promise<void> {
    await AppDataSource.manager.remove(user);
  }

  async saveUser(user: User): Promise<User> {
    return await AppDataSource.manager.save(user);
  }

  async createUserDetails(userDetails: UserDetails): Promise<UserDetails> {
    return await AppDataSource.manager.save(userDetails);
  }

  async saveUserDetails(userDetails: UserDetails): Promise<UserDetails> {
    return await AppDataSource.manager.save(userDetails);
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

  async createUserReportsTo(
    userReportsTo: UserReportsTo,
  ): Promise<UserReportsTo> {
    return await AppDataSource.manager.save(userReportsTo);
  }

  async findUserWithPermissions(userId: string): Promise<User | null> {
    return await AppDataSource.manager.findOne(User, {
      where: {
        user_id: userId,
      },
      relations: {
        role: { permissions: true },
      },
    });
  }
}
