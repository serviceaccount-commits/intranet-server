"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../../../shared/database/data-source");
const User_entity_1 = require("../entities/User.entity");
const UserDetail_entity_1 = require("../entities/UserDetail.entity");
const UserReportsTo_entity_1 = require("../entities/UserReportsTo.entity");
class UserRepository {
    async createUser(user) {
        return await data_source_1.AppDataSource.manager.save(user);
    }
    async updateUserLastActivity(userId) {
        await data_source_1.AppDataSource.manager.update(User_entity_1.User, userId, {
            last_activity_at: new Date(),
        });
    }
    async findAllUsers() {
        return await data_source_1.AppDataSource.manager.find(User_entity_1.User);
    }
    async findAndCountUsers(filters) {
        const { page, limit, status, selectableAsLeader, search, roleId, clientId, assignmentId, reportsToId, } = filters;
        const queryBuilder = data_source_1.AppDataSource.manager
            .createQueryBuilder(User_entity_1.User, 'user')
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
            }
            else if (stat && stat.length === 1) {
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
            queryBuilder.andWhere(new typeorm_1.Brackets((qb) => {
                qb.where('user.first_name ILIKE :searchName', {
                    searchName: `%${search}%`,
                })
                    .orWhere('user.last_name ILIKE :searchName', {
                    searchName: `%${search}%`,
                })
                    .orWhere('user.work_email ILIKE :searchName', {
                    searchName: `%${search}%`,
                });
            }));
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
            queryBuilder.andWhere('reportsToRel.reports_to_user_id IN (:...reportsToIds)', {
                reportsToIds: reportsToId[0]?.split(','),
            });
        }
        queryBuilder.skip((page - 1) * limit).take(limit);
        const [users, total] = await queryBuilder
            .orderBy('user.first_name', 'ASC')
            .addOrderBy('user.last_name', 'ASC')
            .getManyAndCount();
        return { users, total };
    }
    async findUserReportsToRelationships(userId) {
        return await data_source_1.AppDataSource.manager.find(UserReportsTo_entity_1.UserReportsTo, {
            where: {
                reports_to_user_id: userId,
            },
        });
    }
    async findAndCountPostUsers(filters) {
        const { page, limit, status, selectableAsLeader, roleId, clientIds, assignmentIds, reportsToId, } = filters;
        const queryBuilder = data_source_1.AppDataSource.manager
            .createQueryBuilder(User_entity_1.User, 'user')
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
    async findUserProfileById(userId) {
        const queryBuilder = data_source_1.AppDataSource.manager
            .createQueryBuilder(User_entity_1.User, 'user')
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
    async findUserById(id) {
        return await data_source_1.AppDataSource.manager.findOne(User_entity_1.User, {
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
    async findUserByIdWithPermissions(id) {
        return await data_source_1.AppDataSource.manager.findOne(User_entity_1.User, {
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
    async findUserByIds(ids) {
        if (!ids || ids.length === 0)
            return [];
        return await data_source_1.AppDataSource.manager.find(User_entity_1.User, {
            where: {
                user_id: (0, typeorm_1.In)(ids),
            },
        });
    }
    async findUserByEmail(email) {
        return await data_source_1.AppDataSource.manager.findOne(User_entity_1.User, {
            where: {
                work_email: email,
            },
            relations: {
                role: { permissions: true },
            },
        });
    }
    async findUserByPersonalEmail(email) {
        return await data_source_1.AppDataSource.manager.findOne(UserDetail_entity_1.UserDetails, {
            where: {
                personal_email: email,
            },
        });
    }
    async findUserByPhone(phone) {
        return await data_source_1.AppDataSource.manager.findOne(User_entity_1.User, {
            where: [{ work_phone: phone }],
        });
    }
    async findUserByPersonalPhone(phone) {
        return await data_source_1.AppDataSource.manager.findOne(UserDetail_entity_1.UserDetails, {
            where: {
                personal_phone: phone,
            },
        });
    }
    async findUserByEmergencyContactPhone(phone) {
        return await data_source_1.AppDataSource.manager.findOne(UserDetail_entity_1.UserDetails, {
            where: {
                emergency_contact_phone: phone,
            },
        });
    }
    async deleteUser(user) {
        await data_source_1.AppDataSource.manager.remove(user);
    }
    async saveUser(user) {
        return await data_source_1.AppDataSource.manager.save(user);
    }
    async createUserDetails(userDetails) {
        return await data_source_1.AppDataSource.manager.save(userDetails);
    }
    async saveUserDetails(userDetails) {
        return await data_source_1.AppDataSource.manager.save(userDetails);
    }
    async findUserReportsToRelationship(reportingUserId, reportsToUserId) {
        return await data_source_1.AppDataSource.manager.findOne(UserReportsTo_entity_1.UserReportsTo, {
            where: {
                reporting_user_id: reportingUserId,
                reports_to_user_id: reportsToUserId,
            },
        });
    }
    async createUserReportsTo(userReportsTo) {
        return await data_source_1.AppDataSource.manager.save(userReportsTo);
    }
    async findUserWithPermissions(userId) {
        return await data_source_1.AppDataSource.manager.findOne(User_entity_1.User, {
            where: {
                user_id: userId,
            },
            relations: {
                role: { permissions: true },
            },
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map