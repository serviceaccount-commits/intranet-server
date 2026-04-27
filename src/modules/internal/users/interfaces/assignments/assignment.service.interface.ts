import { Assignment } from '../../entities/Assignment.entity';

export interface IAssignmentService {
  createAssignment(assignmentName: string): Promise<Assignment>;
  getAssignments(): Promise<Assignment[]>;
  updateAssignment(
    assignmentId: string,
    newAssignmentName: string,
  ): Promise<Assignment>;
}
