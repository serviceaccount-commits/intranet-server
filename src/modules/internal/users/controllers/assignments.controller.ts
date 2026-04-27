import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IAssignmentService } from '../interfaces/assignments/assignment.service.interface';

@injectable()
export class AssignmentController {
  constructor(
    @inject(TYPES.IAssignmentService)
    private assignmentService: IAssignmentService,
  ) {}

  async createAssignment(req: Request, res: Response) {
    let { assignmentName } = req.body;

    const newAssignment =
      await this.assignmentService.createAssignment(assignmentName);

    res.json(newAssignment);
  }

  async getAssignments(_req: Request, res: Response) {
    res.json(await this.assignmentService.getAssignments());
  }
}
