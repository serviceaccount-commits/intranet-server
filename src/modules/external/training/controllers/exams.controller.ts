import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { ZodError } from 'zod';
import { AppError } from '../../../../shared/errors/AppError';
import { TYPES } from '../../../../shared/config/containerTypes';
import { IExamAdminService } from '../interfaces/exams/exam-admin.service.interface';
import { IExamStudentService } from '../interfaces/exams/exam-student.service.interface';
import { IExamStandaloneService } from '../interfaces/exams/exam-standalone.service.interface';
import { CreateExamInput } from '../schema/exams/CreateExamSchema';
import { UpdateExamInput } from '../schema/exams/UpdateExamSchema';

@injectable()
export class ExamController {
  constructor(
    @inject(TYPES.IExamAdminService) private examAdminService: IExamAdminService,
    @inject(TYPES.IExamStudentService) private examStudentService: IExamStudentService,
    @inject(TYPES.IExamStandaloneService) private examStandaloneService: IExamStandaloneService,
  ) {}

  // ─── Admin ────────────────────────────────────────────────────────────────────

  async createExam(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateExamInput = req.body;
      const exam = await this.examAdminService.createExam(input);
      res.status(201).json(exam);
    } catch (error) {
      if (error instanceof ZodError) return res.status(400).json({ error });
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async updateExam(req: Request, res: Response, next: NextFunction) {
    try {
      const input: UpdateExamInput = req.body;
      const { examId } = req.params;
      if (!examId) { return res.sendStatus(400); }
      const exam = await this.examAdminService.updateExam(examId, input);
      res.status(200).json(exam);
    } catch (error) {
      if (error instanceof ZodError) return res.status(400).json({ error });
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async deleteExam(req: Request, res: Response, next: NextFunction) {
    try {
      const { examId } = req.params;
      if (!examId) { return res.sendStatus(400); }
      await this.examAdminService.deleteExam(examId);
      res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async getLatestExamVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      if (!classId) { return res.sendStatus(400); }
      const exam = await this.examAdminService.getLatestExamVersion(classId);
      res.status(200).json(exam);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async getAdminExam(req: Request, res: Response, next: NextFunction) {
    try {
      const { examId } = req.params;
      if (!examId) { return res.sendStatus(400); }
      const exam = await this.examAdminService.getAdminExam(examId);
      res.status(200).json(exam);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async getAllClassExams(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      if (!classId) { return res.sendStatus(400); }
      const exams = await this.examAdminService.getAllClassExams(classId);
      res.status(200).json(exams);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async getAllClassExamsMetadataOnly(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      if (!classId) { return res.sendStatus(400); }
      const exams = await this.examAdminService.getAllClassExamsMetadataOnly(classId);
      res.status(200).json(exams);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async getExamsDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) { return res.sendStatus(400); }
      const dashboard = await this.examAdminService.getExamsDashboard();
      res.status(200).json(dashboard);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async getUserExamAttempts(req: Request, res: Response, next: NextFunction) {
    try {
      const { examId, userId } = req.params;
      if (!userId || !examId) { return res.sendStatus(400); }
      const attempts = await this.examAdminService.getUserExamAttempts(userId, examId);
      res.status(200).json(attempts);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  // ─── Student ──────────────────────────────────────────────────────────────────

  async getUserExam(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { classId } = req.params;
      if (!userId || !classId) { return res.sendStatus(400); }
      const exam = await this.examStudentService.getUserExam(classId, userId);
      res.status(200).json(exam);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  // ─── Standalone ───────────────────────────────────────────────────────────────

  async createStandaloneExam(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) { return res.sendStatus(400); }
      const exam = await this.examStandaloneService.createStandaloneExam(userId);
      res.status(201).json(exam);
    } catch (error) {
      if (error instanceof ZodError) return res.status(400).json({ error });
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async getStandaloneExam(req: Request, res: Response, next: NextFunction) {
    try {
      const { standaloneExamId } = req.params;
      if (!standaloneExamId) { return res.sendStatus(400); }
      const exam = await this.examStandaloneService.getStandaloneExam(standaloneExamId);
      res.status(200).json(exam);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async getStandaloneExamMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const { standaloneExamId } = req.params;
      if (!standaloneExamId) { return res.sendStatus(400); }
      const exam = await this.examStandaloneService.getStandaloneExamMetadata(standaloneExamId);
      res.status(200).json(exam);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async updateStandaloneExamName(req: Request, res: Response, next: NextFunction) {
    try {
      const { standaloneExamId } = req.params;
      const { examTitle } = req.body;
      if (!standaloneExamId) { return res.sendStatus(400); }
      await this.examStandaloneService.updateStandaloneExamName(standaloneExamId, examTitle);
      res.status(200).json({ message: 'Exam name updated' });
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async getStandaloneExamsWaitingForApproval(_req: Request, res: Response, next: NextFunction) {
    try {
      const exams = await this.examStandaloneService.getStandaloneExamsWaitingForApproval();
      res.status(200).json(exams);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async requestStandaloneExamApproval(req: Request, res: Response, next: NextFunction) {
    try {
      const { standaloneExamId } = req.params;
      if (!standaloneExamId) { return res.sendStatus(400); }
      const exam = await this.examStandaloneService.requestStandaloneExamApproval(standaloneExamId);
      res.status(200).json(exam);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async approveStandaloneExam(req: Request, res: Response, next: NextFunction) {
    try {
      const { standaloneExamId } = req.params;
      if (!standaloneExamId) { return res.sendStatus(400); }
      const exam = await this.examStandaloneService.approveStandaloneExam(standaloneExamId);
      res.status(200).json(exam);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }

  async getMyStandaloneExams(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) { return res.sendStatus(400); }
      const exams = await this.examStandaloneService.getMyStandaloneExams(userId);
      res.status(200).json(exams);
    } catch (error) {
      if (error instanceof AppError) return res.status(400).json({ message: error.message });
      next(error);
    }
  }
}
