import { injectable } from 'inversify';
import { IAssignmentRepository } from '../interfaces/assignments/assignment.repository.interface';
import { Assignment } from '../entities/Assignment.entity';
import { AppDataSource } from '../../../../shared/database/data-source';
import { In } from 'typeorm';

@injectable()
export class AssignmentRepository implements IAssignmentRepository {
  async create(assignment: Assignment): Promise<Assignment> {
    return await AppDataSource.manager.save(assignment);
  }

  async findAll(): Promise<Assignment[]> {
    return await AppDataSource.manager.find(Assignment);
  }

  async findById(id: string): Promise<Assignment | null> {
    return await AppDataSource.manager.findOne(Assignment, {
      where: {
        assignment_id: id,
      },
    });
  }

  async findByIds(ids: string[]): Promise<Assignment[]> {
    if (!ids || ids.length === 0) return [];
    return await AppDataSource.manager.find(Assignment, {
      where: {
        assignment_id: In(ids),
      },
    });
  }

  async findByName(name: string): Promise<Assignment | null> {
    return await AppDataSource.manager.findOne(Assignment, {
      where: {
        assignment_name: name,
      },
    });
  }

  async save(assignment: Assignment): Promise<Assignment> {
    return await AppDataSource.manager.save(assignment);
  }
}
