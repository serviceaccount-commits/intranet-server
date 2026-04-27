import { Assignment } from '../../entities/Assignment.entity';

export interface IAssignmentRepository {
  create(assignment: Assignment): Promise<Assignment>;
  findAll(): Promise<Assignment[]>;
  findById(id: string): Promise<Assignment | null>;
  findByIds(ids: string[]): Promise<Assignment[]>;
  findByName(name: string): Promise<Assignment | null>;
  save(assignment: Assignment): Promise<Assignment>;
}
