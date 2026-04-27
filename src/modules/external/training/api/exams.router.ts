import { Request, Response, NextFunction, Router } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { ExamController } from '../controllers/exams.controller';

const examController = container.get<ExamController>(ExamController);

const examRouter = Router();

examRouter.get(
  '/class/latest/:classId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.getLatestExamVersion(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

examRouter.get(
  '/admin/:examId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.getAdminExam(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

examRouter.get(
  '/class/:classId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.getAllClassExams(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

// TODO: USE ENDPOINT ON CLIENT TO DISPLAY VERSIONS SIDEBAR
examRouter.get(
  '/class/versions/:classId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.getAllClassExamsMetadataOnly(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

examRouter.get(
  '/dashboard',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.getExamsDashboard(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

examRouter.get(
  '/attempts/exam/:examId/user/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.getUserExamAttempts(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

examRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.createExam(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

examRouter.put(
  '/:examId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.updateExam(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

examRouter.delete(
  '/:examId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.deleteExam(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

// STUDENT FACING
examRouter.get(
  '/class/:classId/user',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.getUserExam(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

examRouter.post(
  '/standalone',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.createStandaloneExam(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

examRouter.put(
  '/standalone/title/:standaloneExamId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.updateStandaloneExamName(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

examRouter.put(
  '/standalone/admin/request-approval/:standaloneExamId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.requestStandaloneExamApproval(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

examRouter.put(
  '/standalone/admin/approve/:standaloneExamId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.approveStandaloneExam(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

// TODO: REVISAR LA ESTRUCTURA DE DATOS QUE ESTOY ENVIANDO AL FRONTEND PAR Y USAR EL NOMBRE CORRECTAMENTE EN EL FRONTEND

examRouter.get(
  '/standalone/:standaloneExamId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.getStandaloneExam(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

examRouter.get(
  '/standalone/:standaloneExamId/metadata',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.getStandaloneExamMetadata(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

// TODO: REVISAR LA ESTRUCTURA DE DATOS QUE ESTOY ENVIANDO AL FRONTEND PAR Y USAR EL NOMBRE CORRECTAMENTE EN EL FRONTEND

examRouter.get(
  '/standalone/admin/waiting-for-approval',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.getStandaloneExamsWaitingForApproval(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

// TODO: REVISAR LA ESTRUCTURA DE DATOS QUE ESTOY ENVIANDO AL FRONTEND

examRouter.get(
  '/standalone/admin/mine',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await examController.getMyStandaloneExams(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export { examRouter };
