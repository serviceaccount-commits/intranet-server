import { inject, injectable } from 'inversify';
import { IAssignmentService } from '../interfaces/assignments/assignment.service.interface';
import { Assignment } from '../entities/Assignment.entity';
import { AppDataSource } from '../../../../shared/database/data-source';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IAssignmentRepository } from '../interfaces/assignments/assignment.repository.interface';
import { ConflictError } from '../../../../shared/errors/ConflictError';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

@injectable()
export class AssignmentService implements IAssignmentService {
  constructor(
    @inject(TYPES.IAssignmentRepository)
    private assignmentRepository: IAssignmentRepository,
  ) {}

  async createAssignment(assignmentName: string): Promise<Assignment> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const existingAssignment =
        await this.assignmentRepository.findByName(assignmentName);
      if (existingAssignment) {
        throw new ConflictError(
          `Assignment with name ${assignmentName} already exists.`,
        );
      }

      const newAssignment = new Assignment();
      newAssignment.assignment_name = assignmentName;

      return await this.assignmentRepository.create(newAssignment);
    });
  }

  async getAssignments(): Promise<Assignment[]> {
    return await this.assignmentRepository.findAll();
  }

  async updateAssignment(
    assignmentId: string,
    newAssignmentName: string,
  ): Promise<Assignment> {
    return await AppDataSource.manager.transaction(async (_t) => {
      const assignment = await this.assignmentRepository.findById(assignmentId);

      if (!assignment) {
        throw new NotFoundError('Assignment', assignmentId);
      }

      assignment.assignment_name = newAssignmentName;

      return await this.assignmentRepository.save(assignment);
    });
  }
}
