"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const zod_1 = require("zod");
const AppError_1 = require("../../../../shared/errors/AppError");
let CourseController = class CourseController {
    courseService;
    constructor(courseService) {
        this.courseService = courseService;
    }
    async createCourse(req, res, next) {
        try {
            const input = req.body;
            const userId = req.user?.id;
            if (!userId) {
                res.status(400);
                return;
            }
            input.userId = userId;
            const course = await this.courseService.createCourse(input);
            res.status(201).json(course);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error });
            }
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    async updateCourse(req, res, next) {
        try {
            const { courseId } = req.params;
            const input = req.body;
            if (!courseId) {
                res.sendStatus(400);
                return;
            }
            await this.courseService.updateCourse(courseId, input);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    async updateCourseTitle(req, res, next) {
        try {
            const { courseId } = req.params;
            const input = req.body;
            if (!courseId) {
                res.sendStatus(400);
                return;
            }
            await this.courseService.updateCourseTitle(courseId, input.courseName);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    async updateCourseDescription(req, res, next) {
        try {
            const { courseId } = req.params;
            const input = req.body;
            if (!courseId) {
                res.sendStatus(400);
                return;
            }
            await this.courseService.updateCourseDescription(courseId, input.courseDescription);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    async getPublicCourses(_req, res) {
        const courses = await this.courseService.getCourses(false);
        res.json(courses);
    }
    async getAdminCourses(_req, res) {
        const courses = await this.courseService.getCourses(true);
        res.json(courses);
    }
    async getCreatedCourses(req, res, next) {
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        try {
            const courses = await this.courseService.getCreatedCourses(userId);
            res.status(200).json(courses);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error });
            }
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    async getCourseById(req, res) {
        const { courseId } = req.params;
        if (!courseId) {
            res.sendStatus(400);
            return;
        }
        const course = await this.courseService.getCourseById(courseId);
        res.json(course);
    }
    async getCourseValues(req, res) {
        const { courseId } = req.params;
        if (!courseId) {
            res.sendStatus(400);
            return;
        }
        const courseValues = await this.courseService.getCourseValues(courseId);
        res.json(courseValues);
    }
    async getUserCoursesWithProgress(req, res, next) {
        try {
            // TODO: Get userId securely from authenticated request
            const userId = req.user?.id;
            if (!userId) {
                res.sendStatus(400);
                return;
            }
            const coursesWithProgress = await this.courseService.getCoursesWithProgress(userId);
            res.status(200).json(coursesWithProgress);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error });
            }
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    async getCourseTopicsWithProgress(req, res, next) {
        try {
            const { courseId } = req.params;
            const userId = req.user?.id;
            if (!userId || !courseId) {
                res.sendStatus(400);
                return;
            }
            const topicsWithProgress = await this.courseService.getCourseTopicsWithProgress(userId, courseId);
            res.status(200).json(topicsWithProgress);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error });
            }
            if (error instanceof AppError_1.AppError) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
};
exports.CourseController = CourseController;
exports.CourseController = CourseController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ICourseService)),
    __metadata("design:paramtypes", [Object])
], CourseController);
//# sourceMappingURL=courses.controller.js.map