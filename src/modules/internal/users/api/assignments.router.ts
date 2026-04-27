import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { AssignmentController } from '../controllers/assignments.controller';

const assignmentController =
  container.get<AssignmentController>(AssignmentController);

const assignmentsRouter = Router();

assignmentsRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await assignmentController.createAssignment(req, res);
    } catch (error) {
      next(error);
    }
  },
);

assignmentsRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await assignmentController.getAssignments(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export { assignmentsRouter };
