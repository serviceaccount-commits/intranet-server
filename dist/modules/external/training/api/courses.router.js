"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseRouter = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../../../shared/config/inversify.config");
const courses_controller_1 = require("../controllers/courses.controller");
const courseController = inversify_config_1.container.get(courses_controller_1.CourseController);
const courseRouter = (0, express_1.Router)();
exports.courseRouter = courseRouter;
courseRouter.post('/', async (req, res, next) => {
    try {
        await courseController.createCourse(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//getting all courses no matter the status
courseRouter.get('/', async (req, res, next) => {
    try {
        await courseController.getPublicCourses(req, res);
    }
    catch (error) {
        next(error);
    }
});
courseRouter.get('/:courseId', async (req, res, next) => {
    try {
        await courseController.getCourseById(req, res);
    }
    catch (error) {
        next(error);
    }
});
courseRouter.get('/user/progress', async (req, res, next) => {
    try {
        await courseController.getUserCoursesWithProgress(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
courseRouter.get('/admin/created', async (req, res, next) => {
    try {
        await courseController.getAdminCourses(req, res);
    }
    catch (error) {
        next(error);
    }
});
//getting active/published topics for a specific user
courseRouter.get('/course/:courseId/progress', async (req, res, next) => {
    try {
        await courseController.getCourseTopicsWithProgress(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
courseRouter.put('/:courseId', async (req, res, next) => {
    try {
        await courseController.updateCourse(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
courseRouter.put('/title/:courseId', async (req, res, next) => {
    try {
        await courseController.updateCourseTitle(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
courseRouter.put('/description/:courseId', async (req, res, next) => {
    try {
        await courseController.updateCourseDescription(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=courses.router.js.map