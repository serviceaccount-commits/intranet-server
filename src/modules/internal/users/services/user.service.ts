import { inject, injectable } from 'inversify';
import {
  IUserService,
  PaginatedUsersResult,
  RankingRow,
} from '../interfaces/users/user.service.interface';
import ES from '../../../../shared/types/enum/ES';
import { User } from '../entities/User.entity';
import { AppDataSource } from '../../../../shared/database/data-source';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IUserRepository } from '../interfaces/users/user.repository.interface';
import { IRoleRepository } from '../interfaces/roles/role.repository.interface';
import { UserDetails } from '../entities/UserDetail.entity';
import { In } from 'typeorm';
import { Client } from '../../../external/knowledgeBase/entities/Client.entity';
import {
  CreateUserInput,
  CreateUserSchema,
} from '../schema/users/CreateUserSchema';
import {
  UpdateUserInput,
  UpdateUserSchema,
} from '../schema/users/UpdateUserSchema';
import { ExternalValidationService } from './externalValidation.service';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { InvalidDataFormatError } from '../../../../shared/errors/InvalidDataFormatError';
import { IUserReportsToService } from '../interfaces/userReportsTo/userReportsTo.service.interface';
import { IAssignmentRepository } from '../interfaces/assignments/assignment.repository.interface';
import { Assignment } from '../entities/Assignment.entity';
import { FilterUserInput } from '../schema/users/FilterUserSchema';
import { BusinessValidationError } from '../../../../shared/errors/BusinessValidationError';
import { CompleteUserProfile } from '../types/Users.types';

import { google } from 'googleapis';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IRoleRepository) private roleRepository: IRoleRepository,
    @inject(TYPES.IAssignmentRepository)
    private assignmentRepository: IAssignmentRepository,
    @inject(TYPES.ExternalValidationService)
    private externalValidationService: ExternalValidationService,
    @inject(TYPES.IUserReportsToService)
    private userReportsToService: IUserReportsToService,
  ) {}

  private async _validateContactInfoExternally(
    input: UpdateUserInput | CreateUserInput,
    currentUser: User | null = null,
    businessErrors: Record<string, string>,
  ): Promise<void> {
    // work email
    if (
      input.workEmail &&
      (!currentUser || input.workEmail !== currentUser.work_email)
    ) {
      const isEmailValid = await this.externalValidationService.isEmailValid(
        input.workEmail,
      );
      if (!isEmailValid) {
        businessErrors['workEmail'] = 'Work email is invalid or undeliverable.';
      }
    }

    // personal email
    if (
      input.personalEmail &&
      (!currentUser ||
        input.personalEmail === currentUser.userDetails.personal_email)
    ) {
      const isEmailValid = await this.externalValidationService.isEmailValid(
        input.personalEmail,
      );
      if (!isEmailValid) {
        businessErrors['personalEmail'] =
          'Personal email is invalid or undeliverable.';
      }
    }

    // work phone
    if (
      input.workPhone &&
      (!currentUser || input.workPhone !== currentUser?.work_phone)
    ) {
      const isPhoneValid =
        await this.externalValidationService.isPhoneNumberValid(
          input.workPhone,
        );
      if (!isPhoneValid) {
        businessErrors['workPhone'] = 'Work phone is invalid or undeliverable.';
      }
    }

    //personal phone
    if (
      input.personalPhone &&
      (!currentUser ||
        input.personalPhone !== currentUser.userDetails.personal_phone)
    ) {
      const isPhoneValid =
        await this.externalValidationService.isPhoneNumberValid(
          input.personalPhone,
        );
      if (!isPhoneValid) {
        businessErrors['personalPhone'] =
          'Personal phone is invalid or undeliverable.';
      }
    }

    // emergency phone
    if (
      input.emergencyContactPhone &&
      (!currentUser ||
        input.emergencyContactPhone !==
          currentUser.userDetails.emergency_contact_phone)
    ) {
      const isPhoneValid =
        await this.externalValidationService.isPhoneNumberValid(
          input.emergencyContactPhone,
        );
      if (!isPhoneValid) {
        businessErrors['emergencyContactPhone'] =
          'Emergency contact phone is invalid or undeliverable';
      }
    }
  }

  async createUser(userData: CreateUserInput): Promise<User> {
    const businessErrors: Record<string, string> = {};

    const validatedData = CreateUserSchema.parse(userData);

    await this._validateContactInfoExternally(
      validatedData,
      null,
      businessErrors,
    );

    return await AppDataSource.manager.transaction(async (_t) => {
      const role = await this.roleRepository.findById(userData.roleId);
      if (!role) throw new NotFoundError('Role', validatedData.roleId);

      let clients: Client[] = [];
      if (validatedData.clientIds !== undefined) {
        if (validatedData.clientIds.length > 0) {
          const clientsFound = await AppDataSource.getRepository(Client).find({
            where: { client_id: In(validatedData.clientIds) },
          });
          if (clientsFound.length !== validatedData.clientIds.length) {
            throw new NotFoundError('Client(s)');
          }
          clients = clientsFound;
        }
      }

      let assignments: Assignment[] = [];
      if (validatedData.assignmentIds !== undefined) {
        if (validatedData.assignmentIds.length > 0) {
          const assignmentsFound = await this.assignmentRepository.findByIds(
            validatedData.assignmentIds,
          );
          if (assignmentsFound.length !== validatedData.assignmentIds.length) {
            throw new NotFoundError('Assignment(s)');
          }
          assignments = assignmentsFound as Assignment[];
        }
      }
      const existingByPersonalEmail =
        await this.userRepository.findUserByPersonalEmail(
          validatedData.personalEmail,
        );
      if (existingByPersonalEmail)
        businessErrors['personalEmail'] = 'Personal email is already in use.';

      const existingByPersonalPhone =
        await this.userRepository.findUserByPersonalPhone(
          validatedData.personalPhone,
        );
      if (existingByPersonalPhone)
        businessErrors['personalPhone'] = 'Personal phone is already in use.';

      const existingByEmergencyContactPhone =
        await this.userRepository.findUserByEmergencyContactPhone(
          validatedData.emergencyContactPhone,
        );
      if (existingByEmergencyContactPhone)
        businessErrors['emergencyContactPhone'] =
          'Emergency contact phone is already in use.';

      const hiredDate = new Date(validatedData.hireDate);

      if (isNaN(hiredDate.getTime())) {
        throw new InvalidDataFormatError('hireDate');
      }

      const existingByWorkEmail = await this.userRepository.findUserByEmail(
        validatedData.workEmail,
      );
      if (existingByWorkEmail)
        businessErrors['workEmail'] = 'Work email is already in use.';

      const existingByWorkPhone = await this.userRepository.findUserByPhone(
        validatedData.workPhone,
      );
      if (existingByWorkPhone)
        businessErrors['workPhone'] = 'Work phone is already in use.';

      if (Object.keys(businessErrors).length > 0) {
        throw new BusinessValidationError(
          'Business validation failed.',
          businessErrors,
        );
      }

      const newUserDetails = new UserDetails();
      newUserDetails.personal_email = validatedData.personalEmail;
      newUserDetails.personal_phone = validatedData.personalPhone;
      newUserDetails.residential_country = validatedData.residentialCountry;
      newUserDetails.country_nationality = validatedData.countryNationality;
      newUserDetails.emergency_contact_name =
        validatedData.emergencyContactName;
      newUserDetails.emergency_contact_phone =
        validatedData.emergencyContactPhone;
      newUserDetails.hire_date = hiredDate;

      const userDetails =
        await this.userRepository.createUserDetails(newUserDetails);

      const newUser = new User();
      newUser.first_name = validatedData.firstName;
      newUser.last_name = validatedData.lastName;
      newUser.work_email = validatedData.workEmail;
      newUser.work_phone = validatedData.workPhone;
      newUser.selectable_as_leader = validatedData.selectableAsLeader;
      newUser.job_title = validatedData.jobTitle;
      newUser.status = ES.ACTIVE;
      newUser.role = role;
      newUser.role_id = role.role_id;
      newUser.userDetails = userDetails;
      newUser.user_details_id = userDetails.user_details_id;

      if (clients) {
        newUser.clients = clients;
      }
      if (assignments) {
        newUser.assignments = assignments;
      }

      const user = await this.userRepository.createUser(newUser);

      if (
        validatedData.reportsToId &&
        validatedData.reportsToId !== ES.NO_REPORTS_TO
      ) {
        await this.userReportsToService.createUserReportsTo(
          user.user_id,
          validatedData.reportsToId,
        );
      }

      return user;
    });
  }

  async updateUserLastActivity(userId: string): Promise<void> {
    await this.userRepository.updateUserLastActivity(userId);
  }

  async getUsers(): Promise<User[]> {
    return await this.userRepository.findAllUsers();
  }

  async findUsers(filters: FilterUserInput): Promise<PaginatedUsersResult> {
    return await this.userRepository.findAndCountUsers(filters);
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    return user;
  }

  async getUserProfileById(
    userId: string,
    _withNoPhoneNumberCode: boolean,
  ): Promise<CompleteUserProfile> {
    const user = await this.userRepository.findUserProfileById(userId);
    const userReportsToRelationships =
      await this.userRepository.findUserReportsToRelationships(userId);

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    let workNumber = user.work_phone;
    let personalNumber = user.userDetails.personal_phone;
    let emergencyContactNumber = user.userDetails.emergency_contact_phone;
    // if (user.work_phone && withNoPhoneNumberCode) {
    //   const original = user.work_phone;

    //   const firstSpaceIndex = original.indexOf(' ');

    //   if (firstSpaceIndex !== -1) {
    //     original.slice(0, firstSpaceIndex);
    //     workNumber = original.slice(firstSpaceIndex + 1);
    //   }
    // }
    // if (user.userDetails.personal_phone && withNoPhoneNumberCode) {
    //   personalNumber =
    //     user.userDetails.personal_phone.split(' ', 2)[1] ||
    //     user.userDetails.personal_phone;
    // }
    // if (user.userDetails.emergency_contact_phone && withNoPhoneNumberCode) {
    //   emergencyContactNumber =
    //     user.userDetails.emergency_contact_phone.split(' ', 2)[1] ||
    //     user.userDetails.emergency_contact_phone;
    // }

    const profile: CompleteUserProfile = {
      public_profile: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        work_email: user.work_email,
        work_phone: workNumber,
        job_title: user.job_title,
        reports_to_id: user.reportingTo?.reports_to_user_id
          ? user.reportingTo?.reports_to_user_id
          : '',
        reports_to_first_name: user.reportingTo?.reportsToUser?.first_name
          ? user.reportingTo?.reportsToUser?.first_name
          : '',
        reports_to_last_name: user.reportingTo?.reportsToUser?.last_name
          ? user.reportingTo?.reportsToUser?.last_name
          : '',
        assignments: user.assignments ? user.assignments : [],
        role: user.role ? user.role : null,
      },
      private_profile: {
        personal_email: user.userDetails.personal_email,
        personal_phone: personalNumber,
        residential_country: user.userDetails.residential_country,
        country_nationality: user.userDetails.country_nationality,
        emergency_contact_name: user.userDetails.emergency_contact_name,
        emergency_contact_phone: emergencyContactNumber,
        selectable_as_leader: user.selectable_as_leader,
        hire_date: user.userDetails.hire_date,
        clients: user.clients ? user.clients : [],
        last_activity_at: user.last_activity_at || null,
      },
      reporting_user_count: userReportsToRelationships.length || 0,
    };

    return profile;
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    const businessErrors: Record<string, string> = {};

    const validatedData = UpdateUserSchema.parse(input);

    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // TODO: ADD ERROR COLLECTOR AND RETURN MULTIPLE BUSINESS LOGIC ERRORS.

    await this._validateContactInfoExternally(
      validatedData,
      user,
      businessErrors,
    );

    return await AppDataSource.manager.transaction(async (_t) => {
      const user = await this.userRepository.findUserById(userId);

      if (!user) {
        throw new NotFoundError('User', userId);
      }

      if (
        validatedData.workEmail !== undefined &&
        validatedData.workEmail !== user.work_email
      ) {
        const existing = await this.userRepository.findUserByEmail(
          validatedData.workEmail,
        );
        if (existing) {
          businessErrors['workEmail'] = 'Work email is already in use.';
        }
      }
      if (
        validatedData.workPhone !== undefined &&
        validatedData.workPhone !== user.work_phone
      ) {
        const existing = await this.userRepository.findUserByPhone(
          validatedData.workPhone,
        );
        if (existing) {
          businessErrors['workPhone'] = 'Work phone is already in use.';
        }
      }

      if (validatedData.firstName !== undefined)
        user.first_name = validatedData.firstName;
      if (validatedData.lastName !== undefined)
        user.last_name = validatedData.lastName;
      if (validatedData.workEmail !== undefined)
        user.work_email = validatedData.workEmail;
      if (validatedData.workPhone !== undefined)
        user.work_phone = validatedData.workPhone;
      if (validatedData.selectableAsLeader !== undefined)
        user.selectable_as_leader = validatedData.selectableAsLeader;
      if (validatedData.jobTitle !== undefined)
        user.job_title = validatedData.jobTitle;

      const userDetails = user.userDetails;
      if (userDetails) {
        let detailsChanged = false;

        if (
          validatedData.personalEmail !== undefined &&
          validatedData.personalEmail !== user.userDetails.personal_email
        ) {
          const existing = await this.userRepository.findUserByPersonalEmail(
            validatedData.personalEmail,
          );
          if (existing) {
            businessErrors['personalEmail'] =
              'Personal email is already in use.';
          }
        }
        if (
          validatedData.personalPhone !== undefined &&
          validatedData.personalPhone !== user.userDetails.personal_phone
        ) {
          const existing = await this.userRepository.findUserByPersonalPhone(
            validatedData.personalPhone,
          );
          if (existing) {
            businessErrors['personalPhone'] =
              'Personal phone is already in use.';
          }
        }
        if (
          validatedData.emergencyContactPhone !== undefined &&
          validatedData.emergencyContactPhone !==
            user.userDetails.emergency_contact_phone
        ) {
          const existing =
            await this.userRepository.findUserByEmergencyContactPhone(
              validatedData.emergencyContactPhone,
            );
          if (existing) {
            businessErrors['emergencyContactPhone'] =
              'Emergency contact phone is already in use.';
          }
        }

        if (Object.keys(businessErrors).length > 0) {
          throw new BusinessValidationError(
            'Business validation failed.',
            businessErrors,
          );
        }

        if (validatedData.personalEmail !== undefined) {
          userDetails.personal_email = validatedData.personalEmail;
          detailsChanged = true;
        }
        if (validatedData.personalPhone !== undefined) {
          userDetails.personal_phone = validatedData.personalPhone;
          detailsChanged = true;
        }
        if (validatedData.residentialCountry !== undefined) {
          userDetails.residential_country = validatedData.residentialCountry;
          detailsChanged = true;
        }
        if (validatedData.countryNationality !== undefined) {
          userDetails.country_nationality = validatedData.countryNationality;
          detailsChanged = true;
        }
        if (validatedData.emergencyContactName !== undefined) {
          userDetails.emergency_contact_name =
            validatedData.emergencyContactName;
          detailsChanged = true;
        }
        if (validatedData.emergencyContactPhone !== undefined) {
          userDetails.emergency_contact_phone =
            validatedData.emergencyContactPhone;
          detailsChanged = true;
        }
        if (
          validatedData.reHirable !== undefined &&
          validatedData.reHirable !== null
        ) {
          userDetails.re_hirable = validatedData.reHirable;
          detailsChanged = true;
        }
        if (validatedData.hireDate !== undefined) {
          const hiredDate = new Date(validatedData.hireDate);
          if (isNaN(hiredDate.getTime())) {
            throw new InvalidDataFormatError('hireDate');
          }
          userDetails.hire_date = hiredDate;
          detailsChanged = true;
        }

        if (detailsChanged) {
          await this.userRepository.saveUserDetails(userDetails);
        }
      }
      if (
        validatedData.roleId !== undefined &&
        user.role_id !== validatedData.roleId
      ) {
        const role = await this.roleRepository.findById(validatedData.roleId);
        if (!role) {
          throw new NotFoundError('Role', validatedData.roleId);
        }
        user.role = role;
        user.role_id = role.role_id;
      }

      if (validatedData.clientIds !== undefined) {
        if (validatedData.clientIds.length > 0) {
          const clients = await AppDataSource.getRepository(Client).find({
            where: { client_id: In(validatedData.clientIds) },
          });
          if (clients.length !== validatedData.clientIds.length) {
            throw new NotFoundError('Client(s)');
          }
          user.clients = clients;
        } else {
          user.clients = [];
        }
      }

      if (validatedData.assignmentIds !== undefined) {
        const assignmentsFound = await this.assignmentRepository.findByIds(
          validatedData.assignmentIds,
        );
        if (assignmentsFound.length !== validatedData.assignmentIds.length) {
          throw new NotFoundError('Assignment(s)');
        }
        user.assignments = assignmentsFound as Assignment[];
      }
      if (
        validatedData.reportsToId &&
        validatedData.reportsToId !== ES.NO_REPORTS_TO
      ) {
        await this.userReportsToService.updateUserReportsTo(
          user.user_id,
          validatedData.reportsToId,
        );
      }

      return await this.userRepository.saveUser(user);
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await AppDataSource.manager.transaction(async (_t) => {
      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
      }
      await this.userRepository.deleteUser(user);
    });
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userRepository.findUserWithPermissions(userId);

    if (!user) {
      throw new NotFoundError('User', userId);
    }
    return user.role.permissions.map((permission) => permission.permission_id);
  }

  async getSheetData(
    userId: string,
    sheetDataOption: 1 | 2,
  ): Promise<RankingRow[]> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // const keyFilePath = path.join(
    //   __dirname,
    //   '..',
    //   '..',
    //   '..',
    //   '..',
    //   '..',
    //   'intranetserviceaccount-012f39dadb99.json',
    // );

    const keyFilePath = process.env['GOOGLE_APPLICATION_CREDENTIALS'];

    if (!keyFilePath) {
      throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS in .env');
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    let spreadsheetId = '1ZVgfKwMFEzoNcXjBZO46JKiE1AMsJ2Ur88vvTK05WxQ';
    let range = '';

    if (sheetDataOption === 1) {
      range = 'IM Ranking!A2:AF31';
    } else {
      range = 'FLX Ranking!A2:AF6';
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const rankingData: RankingRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (!row) continue;
      if (row[2] === '-') continue;

      if (rankingData.findIndex((r) => r.name === row[3]) !== -1) continue;

      rankingData.push({
        rank: parseInt(row[24]),
        rankWeight: row[23],
        name: row[3],
        QA: row[11],
        CSAT: row[9],
        ACW: row[6],
        AHT_IN: row[7],
        is_me:
          row[4] === user.work_email || row[4] === 'andrea.uribe@paricus.com',
      });
    }

    rankingData.sort((a, b) => a.rank - b.rank);

    return rankingData;
  }
}
